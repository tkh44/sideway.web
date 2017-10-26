import { handleActions } from 'redux-actions'
import { isEmpty, get } from 'lodash'
import ls from 'utils/localstorage'
import { getTicketStatus, hawkNow } from 'utils/hawk'
import { api, createApiAction } from 'api'

const setEmptyTicketToNull = val => {
  return isEmpty(val) ? null : val
}

const storedTickets = {
  app: setEmptyTicketToNull(ls.getItem('appTicket')),
  user: setEmptyTicketToNull(ls.getItem('userTicket'))
}

export const INIT_AUTH = 'auth/INIT_AUTH'
export const APP_TICKET_START = 'auth/APP_TICKET_START'
export const APP_TICKET_SUCCESS = 'auth/APP_TICKET_SUCCESS'
export const APP_TICKET_ERROR = 'auth/APP_TICKET_ERROR'
export const APP_TICKET_RESET = 'auth/APP_TICKET_RESET'
export const USER_TICKET_START = 'auth/USER_TICKET_START'
export const USER_TICKET_SUCCESS = 'auth/USER_TICKET_SUCCESS'
export const USER_TICKET_ERROR = 'auth/USER_TICKET_ERROR'
export const USER_TICKET_RESET = 'auth/USER_TICKET_RESET'
export const NO_USER_TICKET = 'auth/NO_USER_TICKET'
export const GET_USER_TICKET = 'auth/GET_USER_TICKET'
export const APP_TICKET_RENEWAL = 'auth/APP_TICKET_RENEWAL'
export const APP_TICKET_RENEWAL_SUCCESS = 'auth/APP_TICKET_RENEWAL_SUCCESS'
export const APP_TICKET_RENEWAL_ERROR = 'auth/APP_TICKET_RENEWAL_ERROR'
export const APP_TICKET_ONLY_AUTH_COMPLETE = 'auth/APP_TICKET_ONLY_AUTH_COMPLETE'
export const USER_TICKET_RENEWAL = 'auth/USER_TICKET_RENEWAL'
export const USER_TICKET_RENEWAL_SUCCESS = 'auth/USER_TICKET_RENEWAL_SUCCESS'
export const USER_TICKET_RENEWAL_ERROR = 'auth/USER_TICKET_RENEWAL_ERROR'
export const EMAIL_LOGIN = 'auth/EMAIL_LOGIN'
export const EMAIL_LOGIN_ERROR = 'auth/EMAIL_LOGIN_ERROR'
export const DEAUTHORIZE = 'auth/DEAUTHORIZE'
export const LOGOUT = 'auth/LOGOUT'

export const authMiddleware = store => {
  let refreshAppTicketTimer
  let refreshUserTicketTimer
  let appRefreshErrorRetryTimer
  let authRefreshErrorRetryTimer

  const refreshTicket = (ticket, delay = 1000) => {
    return setTimeout(
      () => {
        store.dispatch(authActions.renewTicket(ticket))
      },
      delay
    )
  }

  return next => {
    return action => {
      if (action.type === INIT_AUTH) {
        next(action)
        store.dispatch(authActions.getAppTicket())
        return
      }

      if (action.type === NO_USER_TICKET) {
        next(action)
        store.dispatch({
          type: APP_TICKET_ONLY_AUTH_COMPLETE,
          payload: store.getState().auth.app
        })
        return
      }

      if (
        action.type === APP_TICKET_SUCCESS ||
        action.type === APP_TICKET_RENEWAL_SUCCESS
      ) {
        next(action)

        if (action.type === APP_TICKET_SUCCESS) {
          store.dispatch(authActions.getUserTicket(store.getState().auth.rsvp))
        }

        const { exp } = action.payload
        __DEVELOPMENT__ && console.log('App ticket expires at ', new Date(exp))

        const now = hawkNow()
        const buffer = 60 * 1000
        clearTimeout(refreshAppTicketTimer)
        refreshAppTicketTimer = refreshTicket(
          action.payload,
          Math.max(1000, exp - (now + buffer))
        )
        return
      }

      if (
        action.type === USER_TICKET_SUCCESS ||
        action.type === USER_TICKET_RENEWAL_SUCCESS
      ) {
        next(action)

        const { exp } = action.payload
        __DEVELOPMENT__ &&
          console.log('User ticket expires at ', new Date(exp))

        const now = hawkNow()
        const buffer = 60 * 1000
        clearTimeout(refreshUserTicketTimer)
        refreshUserTicketTimer = refreshTicket(
          action.payload,
          Math.max(1000, exp - (now + buffer))
        )
        return
      }

      if (
        action.type === USER_TICKET_ERROR ||
        action.type === USER_TICKET_RENEWAL_ERROR
      ) {
        const statusCode = get(action.payload, 'statusCode')
        if (Math.round(statusCode / 100) === 4) {
          store.dispatch({
            type: 'modal/SHOW',
            payload: {
              modal: 'login',
              data: {
                nextState: window.location.pathname,
                sessionExpired: true
              }
            }
          })

          return next(action)
        }
      }

      if (action.type === USER_TICKET_RENEWAL_ERROR) {
        clearTimeout(authRefreshErrorRetryTimer)
        authRefreshErrorRetryTimer = refreshTicket(store.getState().auth.user)
        return next(action)
      }

      if (action.type === APP_TICKET_RENEWAL_ERROR) {
        clearTimeout(appRefreshErrorRetryTimer)
        appRefreshErrorRetryTimer = refreshTicket(store.getState().auth.app)
        return next(action)
      }

      if (
        action.type === APP_TICKET_RESET || action.type === USER_TICKET_RESET
      ) {
        next(action)
        store.dispatch(authActions.initAuth())
        return
      }

      if (action.type === LOGOUT) {
        next(action)
        clearTimeout(refreshUserTicketTimer)
        return
      }

      return next(action)
    }
  }
}

export const authActions = {}

authActions.initAuth = rsvp => ({ type: INIT_AUTH, payload: rsvp })

authActions.resetAppTicket = () => {
  ls.removeItem('appTicket')
  return { type: APP_TICKET_RESET }
}

authActions.resetUserTicket = () => {
  ls.removeItem('userTicket')
  return { type: USER_TICKET_RESET }
}

authActions.deauth = () =>
  (dispatch, getState) => {
    dispatch({ type: DEAUTHORIZE })

    const auth = getState().auth
    if (auth.user) {
      dispatch(authActions.resetUserTicket())
    } else if (auth.app) {
      dispatch(authActions.resetAppTicket())
    }
  }

authActions.getAppTicket = () => {
  return async function (dispatch) {
    try {
      const cachedTicket = ls.getItem('appTicket')
      const ticketStatus = getTicketStatus(cachedTicket)

      if (ticketStatus.valid) {
        dispatch({ type: APP_TICKET_SUCCESS, payload: cachedTicket })
        return cachedTicket
      }

      const { ok, data } = await api(
        {
          method: 'POST',
          path: ticketStatus.renewalRequired ? '/oz/reissue' : '/oz/app'
        },
        ticketStatus.renewalRequired ? cachedTicket : window.sideway.hawk.app
      )

      if (ok) {
        ls.setItem('appTicket', data)
        dispatch({ type: APP_TICKET_SUCCESS, payload: data })
        return data
      }

      ls.removeItem('appTicket')
      dispatch({ type: APP_TICKET_ERROR, payload: data })
      return data
    } catch (err) {
      ls.removeItem('appTicket')
      dispatch({ type: APP_TICKET_ERROR, payload: err })
      return err
    }
  }
}

authActions.getUserTicket = rsvp => {
  return async function (dispatch, getState) {
    try {
      if (rsvp) {
        const { ok, data } = await api(
          { method: 'POST', path: '/oz/rsvp', payload: { rsvp } },
          getState().auth.app
        )
        if (ok) {
          ls.setItem('userTicket', data)
          dispatch({ type: USER_TICKET_SUCCESS, payload: data })
          return data
        }

        ls.removeItem('userTicket')
        dispatch({ type: USER_TICKET_ERROR, payload: data })
        return null
      }

      const cachedTicket = ls.getItem('userTicket')
      const ticketStatus = getTicketStatus(cachedTicket)

      if (ticketStatus.valid) {
        dispatch({ type: USER_TICKET_SUCCESS, payload: cachedTicket })
        return cachedTicket
      }

      if (ticketStatus.exists && ticketStatus.renewalRequired) {
        const { ok, data } = await api(
          { method: 'POST', path: '/oz/reissue' },
          cachedTicket
        )
        if (ok) {
          ls.setItem('userTicket', data)
          dispatch({ type: USER_TICKET_SUCCESS, payload: data })
          return data
        }

        ls.removeItem('userTicket')
        dispatch({ type: USER_TICKET_ERROR, payload: data })
        return data
      }

      dispatch({ type: NO_USER_TICKET })
      return null
    } catch (err) {
      dispatch({ type: USER_TICKET_ERROR, payload: err })
      return err
    }
  }
}

authActions.renewTicket = ticket => {
  return async function (dispatch, getState) {
    const isUserTicket = !!('user' in ticket)

    dispatch({ type: isUserTicket ? USER_TICKET_RENEWAL : APP_TICKET_RENEWAL })

    try {
      const { ok, data } = await api(
        { method: 'POST', path: '/oz/reissue' },
        ticket
      )

      if (ok) {
        ls.setItem(isUserTicket ? 'userTicket' : 'appTicket', data)
        dispatch({
          type: isUserTicket
            ? USER_TICKET_RENEWAL_SUCCESS
            : APP_TICKET_RENEWAL_SUCCESS,
          payload: data
        })
        return data
      }

      dispatch({
        type: isUserTicket
          ? USER_TICKET_RENEWAL_ERROR
          : APP_TICKET_RENEWAL_ERROR,
        payload: data
      })
    } catch (err) {
      dispatch({
        type: isUserTicket
          ? USER_TICKET_RENEWAL_ERROR
          : APP_TICKET_RENEWAL_ERROR,
        payload: err
      })
      return err
    }
  }
}

authActions.email = createApiAction(EMAIL_LOGIN, token => {
  return {
    method: 'POST',
    path: '/oz/login/email',
    payload: { ticket: token, app: window.sideway.hawk.app.id }
  }
})

authActions.logout = () => {
  ls.removeItem('userTicket')
  return { type: LOGOUT }
}

const userTicketStatus = getTicketStatus(storedTickets.user)

export const initialState = {
  inProgress: !userTicketStatus.exists || userTicketStatus.renewalRequired,
  app: storedTickets.app,
  user: storedTickets.user
}

export default handleActions(
  {
    [INIT_AUTH]: (state, action) => {
      return { ...state, inProgress: true, rsvp: action.payload }
    },

    [EMAIL_LOGIN]: (state, action) => {
      return {
        ...state,
        inProgress: true
      }
    },

    [APP_TICKET_SUCCESS]: (state, action) => {
      return {
        ...state,
        app: action.payload,
        appError: null
      }
    },

    [APP_TICKET_ERROR]: (state, action) => {
      return {
        ...state,
        inProgress: false,
        appError: action.payload,
        app: null,
        user: null
      }
    },

    [APP_TICKET_RESET]: (state, action) => {
      return {
        ...state,
        app: null
      }
    },

    [APP_TICKET_ONLY_AUTH_COMPLETE]: (state, action) => {
      return {
        ...state,
        inProgress: false
      }
    },

    [APP_TICKET_RENEWAL_SUCCESS]: (state, action) => {
      return {
        ...state,
        app: action.payload,
        appError: null
      }
    },

    [APP_TICKET_RENEWAL_ERROR]: (state, action) => {
      return {
        ...state,
        app: null,
        appError: action.payload
      }
    },

    [USER_TICKET_SUCCESS]: (state, action) => {
      return {
        ...state,
        inProgress: false,
        user: action.payload,
        userError: null,
        rsvp: null
      }
    },

    [USER_TICKET_ERROR]: (state, action) => {
      return {
        ...state,
        inProgress: false,
        user: null,
        userError: action.payload
      }
    },

    [USER_TICKET_RESET]: (state, action) => {
      return { ...state, user: null }
    },

    [NO_USER_TICKET]: (state, action) => {
      return { ...state, inProgress: false, user: null }
    },

    [USER_TICKET_RENEWAL_SUCCESS]: (state, action) => {
      return {
        ...state,
        user: action.payload,
        userError: null
      }
    },

    [USER_TICKET_RENEWAL_ERROR]: (state, action) => {
      return {
        ...state,
        user: null,
        userError: action.payload
      }
    },

    [LOGOUT]: (state, action) => {
      return {
        ...state,
        user: null
      }
    }
  },
  initialState
)
