import { handleActions } from 'redux-actions'
import { isPlainObject, merge, omit, get } from 'lodash'
import { noop } from 'utils/func'
import ls from 'utils/localstorage'
import { USER_TICKET_SUCCESS, LOGOUT, authActions } from 'redux/auth'
import { actions as nesActions } from 'redux/nes'
import { registerActions } from 'redux/register'
import { ROOM_LIST } from 'redux/rooms'
import { CREATE_PAGE, PAGE_LIST } from 'redux/pages'
import { createApiAction, resToState, getResourceId } from 'api'

export const CREATE_USER = 'profile/CREATE_USER'
export const GET_PROFILE = 'profile/GET_PROFILE'
export const PROFILE_SUB_UPDATE = 'profile/PROFILE_SUB_UPDATE'
export const PATCH_PROFILE = 'profile/PATCH_PROFILE'
export const UPDATE_SCOPE = 'profile/UPDATE_SCOPE'
export const ADD_EMAIL = 'profile/ADD_EMAIL'
export const REMOVE_EMAIL = 'profile/REMOVE_EMAIL'
export const VERIFY_EMAIL = 'profile/VERIFY_EMAIL'
export const PRIMARY_EMAIL = 'profile/PRIMARY_EMAIL'
export const UPDATE_MOBILE = 'profile/UPDATE_MOBILE'
export const VERIFY_MOBILE = 'profile/VERIFY_MOBILE'
export const DELETE_MOBILE = 'profile/DELETE_MOBILE'
export const UPDATE_AVATAR = 'profile/UPDATE_AVATAR'
export const INVITE = 'profile/INVITE'
export const LINK = 'profile/LINK'
export const UNLINK = 'profile/UNLINK_PROVIDER'
export const GET_DATA = 'profile/GET_DATA'
export const PUT_DATA = 'profile/PUT_DATA'
export const DELETE_DATA = 'profile/DELETE_DATA'
export const GET_MEDIUM_PUBLICATIONS = 'profile/GET_MEDIUM_PUBLICATIONS'

export const profileMiddleware = store => {
  const shouldShowRegistration = profile => {
    if (profile.id && profile.name && profile.username && profile.primary) {
      return false
    }

    if (profile.app.registrationComplete) {
      return false
    }

    return true
  }

  return next => {
    return action => {
      if (action.type === USER_TICKET_SUCCESS && !store.getState().profile.id) {
        next(action)

        return store.dispatch(profileActions.getProfile()).then(res => {
          if (!res.ok && res.status === 404) {
            store.dispatch(authActions.logout())
          }

          if (res.ok) {
            const profile = res.data
            if (shouldShowRegistration(profile)) {
              store.dispatch(
                registerActions.setRegisterData({
                  name: profile.name,
                  username: profile.username,
                  email: profile.primary
                })
              )

              store.dispatch({
                type: 'modal/SHOW',
                payload: { modal: 'register' }
              })
            } else {
              if (!profile.app.registrationComplete) {
                store.dispatch(
                  profileActions.putData('registrationComplete', true)
                )
              }
            }
          }
        })
      }

      if (
        (action.type === CREATE_USER || action.type === LINK) &&
        get(action, 'meta.response.ok')
      ) {
        ls.removeItem('code')
      }

      if (action.type === LOGOUT) {
        store.dispatch(profileActions.unsubscribeProfile())
      }

      return next(action)
    }
  }
}

export const profileActions = {
  create: createApiAction(CREATE_USER, (payload, invite) => {
    const req = { path: '/user', method: 'POST', payload }
    req.payload.code = ls.getItem('code')
    if (invite && invite.length) {
      req.query = { invite }
    }

    return req
  }),

  getProfile: createApiAction(GET_PROFILE, '/user'),

  subscribeProfile: (cb = noop) => {
    return dispatch => {
      dispatch(nesActions.subscribe('/user', PROFILE_SUB_UPDATE, cb))
    }
  },

  unsubscribeProfile: () => {
    return dispatch => {
      dispatch(nesActions.unsubscribe('/user'))
    }
  },

  patchProfile: createApiAction(PATCH_PROFILE, payload => ({
    method: 'PATCH',
    path: '/user',
    payload
  })),

  updateScope: createApiAction(UPDATE_SCOPE, invite => ({
    method: 'POST',
    path: '/user/scope',
    query: { invite }
  })),

  linkAccount: createApiAction(LINK, network => {
    const req = { path: '/user/link', method: 'PUT', payload: { network } }
    req.payload.code = ls.getItem('code')
    return req
  }),

  unlinkProvider: createApiAction(UNLINK, provider => ({
    path: `/user/link/${provider}`,
    method: 'DELETE'
  })),

  getData: createApiAction(GET_DATA, key => {
    if (key) {
      return `/user/app/${key}`
    }

    return '/user/app'
  }),

  putData: createApiAction(PUT_DATA, (key, value) => ({
    method: 'PUT',
    path: `/user/app/${key}`,
    payload: JSON.stringify(value)
  })),

  deleteData: createApiAction(DELETE_DATA, key => ({
    method: 'DELETE',
    path: `/user/app/${key}`
  })),

  addEmail: createApiAction(ADD_EMAIL, address => ({
    path: `/user/email/${address}`,
    method: 'PUT'
  })),

  verifyEmail: createApiAction(VERIFY_EMAIL, address => ({
    path: `/user/email/${address}`,
    method: 'POST',
    payload: { action: 'verify' }
  })),

  setPrimaryEmail: createApiAction(PRIMARY_EMAIL, address => ({
    path: `/user/email/${address}`,
    method: 'POST',
    payload: { action: 'primary' }
  })),

  deleteEmail: createApiAction(REMOVE_EMAIL, address => ({
    path: `/user/email/${address}`,
    method: 'DELETE'
  })),

  updateMobile: createApiAction(UPDATE_MOBILE, payload => {
    return {
      path: '/user/mobile',
      method: 'PUT',
      payload
    }
  }),

  verifyMobile: createApiAction(VERIFY_MOBILE, code => {
    return {
      path: `/user/mobile/verify/${code}`,
      method: 'POST'
    }
  }),

  deleteMobile: createApiAction(DELETE_MOBILE, () => ({
    path: '/user/mobile',
    method: 'DELETE'
  })),

  updateAvatar: createApiAction(UPDATE_AVATAR, imageBlob => {
    const formData = new window.FormData()
    formData.append('avatar', imageBlob)

    return {
      path: '/user',
      method: 'PATCH',
      payload: formData
    }
  }),

  getMediumPublications: createApiAction(
    GET_MEDIUM_PUBLICATIONS,
    '/user/link/medium'
  )
}

export const initialState = {
  app: {},
  avatar: '',
  emails: {},
  id: null,
  name: '',
  networks: {
    twitter: {},
    medium: {}
  },
  notifications: {},
  preferences: {
    twitter: {},
    medium: {}
  },
  primary: '',
  username: '',
  display: '',
  rooms: undefined,
  pages: undefined
}

const profileReducer = handleActions(
  {
    [CREATE_USER]: (state, action) => {
      const { payload = {}, meta: { fetching, response = {} } } = action
      const { user } = payload

      const nextState = {
        ...state,
        ...user,
        $$meta: {
          ...state.$$meta,
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          fetching
        }
      }
      return nextState
    },

    [GET_PROFILE]: resToState,

    [PROFILE_SUB_UPDATE]: (state, action) => {
      return merge({}, state, action.payload.message)
    },

    [ADD_EMAIL]: (state, action) => {
      if (action.meta.response && action.meta.response.ok === true) {
        const newAddress = getResourceId(action)

        return {
          ...state,
          emails: {
            ...state.emails,
            [newAddress]: {
              verified: false,
              public: false
            }
          }
        }
      }

      return state
    },

    [VERIFY_EMAIL]: (state, action) => {
      const verifiedAddress = getResourceId(action)

      return {
        ...state,
        emails: {
          ...state.emails,
          [verifiedAddress]: {
            ...state.emails[verifiedAddress],
            verified: action.meta.response && action.meta.response.ok
              ? 'waiting'
              : false
          }
        }
      }
    },

    [REMOVE_EMAIL]: (state, action) => {
      const { meta: { response = {} } } = action

      if (response && response.ok) {
        const removedAddress = getResourceId(action)

        return {
          ...state,
          emails: omit(state.emails, removedAddress)
        }
      }

      return state
    },

    [GET_DATA]: (state, action) => {
      const { meta: { response = {} }, payload } = action
      const { status } = response
      const resource = getResourceId(action)

      if (status && status === 200) {
        if (resource === 'app' && isPlainObject(payload)) {
          const nextAppValue = Object.keys(payload).reduce(
            (accum, key) => {
              accum[key] = JSON.parse(payload[key])
              return accum
            },
            {}
          )

          return {
            ...state,
            app: nextAppValue
          }
        }

        return {
          ...state,
          app: {
            ...state.app,
            [resource]: payload
          }
        }
      }

      return state
    },

    [PUT_DATA]: (state, action) => {
      const { meta: { response = {}, request } } = action
      const { status } = response
      const resource = getResourceId(action)

      if (status && status === 204) {
        return {
          ...state,
          app: {
            ...state.app,
            [resource]: JSON.parse(request.payload)
          }
        }
      }

      return state
    },

    [DELETE_DATA]: (state, action) => {
      const resource = getResourceId(action)

      return {
        ...state,
        app: omit(state.app, [resource])
      }
    },

    [GET_MEDIUM_PUBLICATIONS]: (state, action) => {
      const response = resToState({}, action)

      if (get(response, '$$meta.ok')) {
        return {
          ...state,
          networks: {
            ...state.networks,
            medium: {
              ...state.networks.medium,
              ...omit(response, ['$$meta'])
            }
          }
        }
      }

      return state
    },

    [ROOM_LIST]: (state, action) => {
      const response = resToState({}, action)
      const nextState = {
        $$meta: response.$$meta,
        ids: get(response, '$$meta.ok')
          ? Object.keys(omit(response, ['$$meta']))
          : get(state, 'rooms.ids', [])
      }

      return {
        ...state,
        rooms: nextState
      }
    },

    [CREATE_PAGE]: (state, action) => {
      if (action.payload) {
        const nextState = resToState({}, action)
        if (get(nextState, '$$meta.ok')) {
          return {
            ...state,
            pages: {
              ...state.pages,
              ids: [...state.pages.ids].concat(nextState.id)
            }
          }
        }
      }

      return state
    },

    [PAGE_LIST]: (state, action) => {
      const response = resToState({}, action)
      const nextState = {
        $$meta: response.$$meta,
        ids: get(response, '$$meta.ok')
          ? Object.keys(omit(response, ['$$meta']))
          : get(state, 'pages.ids', [])
      }

      return {
        ...state,
        pages: nextState
      }
    },

    'auth/LOGOUT': () => {
      return initialState
    }
  },
  initialState
)

export default profileReducer
