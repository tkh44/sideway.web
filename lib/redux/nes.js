import Nes from 'nes'
import { handleActions } from 'redux-actions'
import { omit, get } from 'lodash'
import { queryString } from 'utils/string'
import { noop } from 'utils/func'
import { secureNesConnection, hawkNow } from 'utils/hawk'
import {
  authActions,
  USER_TICKET_SUCCESS,
  APP_TICKET_ONLY_AUTH_COMPLETE,
  USER_TICKET_RENEWAL_SUCCESS,
  APP_TICKET_RENEWAL_SUCCESS,
  LOGOUT
} from 'redux/auth'

export const internals = {}

export const CONNECT = 'nes/CONNECT'
export const CONNECT_SUCCESS = 'nes/CONNECT_SUCCESS'
export const CONNECT_ERROR = 'nes/CONNECT_ERROR'
export const ERROR = 'nes/ERROR'
export const DISCONNECT = 'nes/DISCONNECT'
export const SUBSCRIBE = 'nes/SUBSCRIBE'
export const SUBSCRIBE_ERROR = 'nes/SUBSCRIBE_ERROR'
export const UNSUBSCRIBE = 'nes/UNSUBSCRIBE'
export const UPDATE = 'nes/UPDATE'
export const QUEUE_ADD = 'nes/QUEUE_ADD'
export const FLUSH_QUEUE = 'nes/FLUSH_QUEUE'

export const createNesClient = (url, dispatch) => {
  const client = new Nes.Client(url)
  return client
}

export const nesMiddleware = store => {
  let reconnectTimer

  const connect = async ticket => {
    try {
      await Promise.resolve(store.dispatch(actions.connect(ticket)))
    } catch (e) {
      __DEVELOPMENT__ && console.log('Caught connection error: ', e)
    }
  }

  const reconnect = (delay = 1000) => {
    clearTimeout(reconnectTimer)

    reconnectTimer = setTimeout(
      () => {
        const state = store.getState()
        connect(state.auth.user || state.auth.app)
        reconnectTimer = null
      },
      delay
    )
  }

  return next => {
    return action => {
      const payload = get(action, 'payload', {})

      if (
        action.type === USER_TICKET_SUCCESS ||
        action.type === APP_TICKET_ONLY_AUTH_COMPLETE
      ) {
        next(action)
        __DEVELOPMENT__ &&
          console.log(`Connecting nes due to: ${action.type}`, action.payload)
        connect(action.payload)
        return
      }

      if (
        action.type === USER_TICKET_RENEWAL_SUCCESS ||
        action.type === APP_TICKET_RENEWAL_SUCCESS
      ) {
        next(action)
        const state = store.getState()

        if (state.nes.connected || state.nes.connecting) {
          store.dispatch(actions.overrideReconnectionAuth(action.payload))
        } else {
          connect(action.payload)
        }
        return
      }

      if (action.type === LOGOUT) {
        next(action)
        connect(store.getState().auth.app)
        return
      }

      if (action.type === CONNECT) {
        clearTimeout(reconnectTimer)
      }

      if (action.type === CONNECT_SUCCESS) {
        next(action)
        store.dispatch(actions.flushQueue())
        return
      }

      if (action.type === CONNECT_ERROR) {
        if (payload.type === 'ws') {
          next(action)

          if (store.getState().nes.connectAttempts <= 20) {
            return reconnect(Math.random() * 1000)
          }
        }

        if (get(payload, 'data.message')) {
          const message = payload.data.message || ''
          const error = payload.data.error || ''

          if (message.includes('Expired ticket')) {
            const state = store.getState()
            store.dispatch(
              authActions.renewTicket(state.auth.user || state.auth.app)
            )
            return
          } else if (
            message.includes('mac') || error.includes('Unauthorized')
          ) {
            next(action)
            __DEVELOPMENT__ &&
              console.log(
                `Reauthenticating due to connection error: ${message}`,
                payload.data
              )
            store.dispatch(authActions.deauth())
            return
          }
        }
      }

      if (
        action.type === DISCONNECT &&
        payload.willReconnect === false &&
        payload.details.wasRequested !== true
      ) {
        next(action)
        return reconnect(1000)
      }

      return next(action)
    }
  }
}

export const actions = {}

actions.onConnect = () => {
  return { type: CONNECT_SUCCESS }
}

actions.onDisconnect = (willReconnect, details) => {
  return { type: DISCONNECT, payload: { willReconnect, details } }
}

actions.onError = err => {
  return { type: ERROR, payload: err }
}

actions.connect = ticket => {
  if (!ticket) {
    console.error('No ticket provided for nes connection')
    return {
      type: CONNECT_ERROR,
      payload: {
        type: 'auth',
        data: { message: 'No ticket provided for nes connection' }
      }
    }
  }

  return (dispatch, getState, { client }) => {
    __DEVELOPMENT__ && console.log('connection starting');

    ['onConnect', 'onDisconnect', 'onError'].forEach(handler => {
      const actionCreator = actions[handler]

      if (client[handler] === actionCreator) {
        return
      }

      client[handler] = (...args) => {
        dispatch(actionCreator(...args))
      }
    })

    return new Promise((resolve, reject) => {
      const onDisconnect = () => {
        dispatch({ type: CONNECT })

        const opts = secureNesConnection(window.sideway.server.api, ticket)
        client.connect(opts, err => {
          if (err) {
            dispatch({ type: CONNECT_ERROR, payload: err })
            return reject(err)
          }
          __DEVELOPMENT__ &&
            console.log(
              `nes connected with ${ticket.user ? 'user' : 'app'} ticket`
            )
          resolve(ticket)
        })
      }

      client.disconnect(onDisconnect)
    })
  }
}

// This is mostly used for tests.
actions.disconnect = (cb = noop) => {
  return (dispatch, getState, { client }) => {
    client.disconnect(cb)
  }
}

actions.overrideReconnectionAuth = ticket => {
  return (dispatch, getState, { client }) => {
    __DEVELOPMENT__ && console.log('overriding connection ticket')
    client.overrideReconnectionAuth(
      secureNesConnection(window.sideway.server.api, ticket).auth
    )
  }
}

actions.request = (req, handlerAction, cb = noop) => {
  return (dispatch, getState, { client }) => {
    if (typeof req === 'string') {
      // Always send full object for consistency
      req = { method: 'GET', path: req }
    }

    if (req.query) {
      req.path += `?${queryString(req.query)}`
    }

    const resource = internals.parseResourceFromPath(req.path)

    if (!req.queued) {
      const reqInitPayload = { req: Object.assign({}, req, { resource }) }
      if (typeof handlerAction === 'function') {
        dispatch(handlerAction(reqInitPayload))
      } else {
        dispatch({ type: handlerAction, payload: reqInitPayload })
      }
    }

    delete req.queued

    if (!(client && client.id)) {
      return dispatch(
        actions.queueAction({
          action: 'request',
          req: Object.assign({}, req, { queued: true }),
          handlerAction,
          cb,
          ts: hawkNow()
        })
      )
    }

    const done = (err, payload, statusCode, headers) => {
      const resActionPayload = internals.createResponseActionPayload(
        err,
        payload,
        statusCode,
        headers,
        req,
        resource
      )

      if (typeof handlerAction === 'function') {
        dispatch(handlerAction(resActionPayload))
      } else {
        dispatch({ type: handlerAction, payload: resActionPayload })
      }

      cb(resActionPayload.error, resActionPayload.data, resActionPayload)
    }

    client.request(req, done)
  }
}

actions.subscribe = (path, handlerAction, cb = noop) => {
  return (dispatch, getState, { client }) => {
    if (!(client && client.id)) {
      return dispatch(
        actions.queueAction({
          action: 'subscribe',
          path,
          handlerAction,
          cb,
          ts: hawkNow()
        })
      )
    }

    const resource = internals.parseResourceFromPath(path)

    const onMessage = (message, flags) =>
      dispatch({
        type: handlerAction,
        payload: { message, flags, path, resource }
      })

    const onSubscribe = err => {
      if (err) {
        dispatch({ type: SUBSCRIBE_ERROR, payload: { error: err } })
        return cb(err)
      }

      dispatch({ type: SUBSCRIBE, payload: { path, handlerAction } })
      cb(null)
    }

    client.subscribe(path, onMessage, onSubscribe)
  }
}

actions.unsubscribe = path => {
  return (dispatch, getState, { client }) => {
    if (client) {
      client.unsubscribe(path, null, () => {
        dispatch({ type: UNSUBSCRIBE, payload: { path } })
      })
    }
  }
}

actions.queueAction = queuedAction => {
  return { type: QUEUE_ADD, payload: queuedAction }
}

actions.flushQueue = () => {
  return (dispatch, getState) => {
    const queue = getState().nes.queue

    if (queue.length) {
      const unique = internals.uniqByActionRequest(queue)

      dispatch({ type: FLUSH_QUEUE })
      unique.reverse().forEach(item => {
        if (item.action === 'subscribe') {
          return dispatch(
            actions.subscribe(item.path, item.handlerAction, item.cb)
          )
        }

        dispatch(actions.request(item.req, item.handlerAction, item.cb))
      })
    }
  }
}

export const initialState = {
  connectAttempts: 0,
  connected: false,
  connecting: false,
  disconnect: null,
  queue: []
}

export const nesReducer = handleActions(
  {
    [CONNECT]: (state, action) => {
      return {
        ...state,
        connectAttempts: ++state.connectAttempts,
        connected: false,
        connecting: true
      }
    },

    [CONNECT_SUCCESS]: (state, action) => {
      return {
        ...state,
        connectAttempts: 0,
        connected: true,
        connecting: false,
        disconnect: null,
        error: null
      }
    },

    [CONNECT_ERROR]: (state, action) => {
      return {
        ...state,
        connected: false,
        connecting: false,
        queue: action.payload.statusCode && action.payload.statusCode === 401
          ? []
          : state.queue,
        error: { ...action.payload }
      }
    },

    [ERROR]: (state, action) => {
      return {
        ...state,
        error: { ...action.payload }
      }
    },

    [DISCONNECT]: (state, action) => {
      return {
        ...state,
        connected: false,
        connecting: false,
        disconnect: action.payload
      }
    },

    [QUEUE_ADD]: (state, action) => {
      return { ...state, queue: [action.payload, ...state.queue] }
    },

    [FLUSH_QUEUE]: (state, action) => {
      return { ...state, queue: [] }
    }
  },
  initialState
)

export const getResourceId = (payload, key = 'id') => {
  const resourceId = payload.data
    ? payload.data[key]
    : payload.req ? payload.req.resource : null

  if (!resourceId) {
    throw new Error('No resource id could be found in payload')
  }

  return resourceId
}

export const resToState = (
  action,
  state = {},
  formatter = itemState => itemState
) => {
  const { payload } = action
  const fetching = !payload.statusCode

  const $$meta = { ...omit(payload, ['data', 'req']), fetching }

  const newState = {
    ...state,
    ...(!payload.error && !fetching && payload.data && !payload.data.statusCode
      ? formatter(payload.data)
      : null), // Fill in data if we have it
    ...(payload.data && payload.data.statusCode
      ? formatter(payload.req.payload)
      : null), // Requests that do not return data use req
    $$meta
  }

  return newState
}

export const collectionToState = (
  { payload },
  state,
  formatter = itemState => itemState
) => {
  const collection = payload.data || []
  const newState = collection.reduce(
    (collect, item) => {
      collect[item.id] = formatter(item)
      return collect
    },
    {
      $$list: {
        ...omit(payload, ['data', 'req']),
        fetching: !(payload.error || payload.statusCode)
      }
    }
  )

  return { ...state, ...newState }
}

export const mapStateDataToArray = stateData =>
  Object.keys(stateData).map(key => stateData[key]).filter(data => !!data.id)

internals.parseResourceFromPath = (path = '') =>
  path.split('/').pop().split('?')[0]

internals.uniqByActionRequest = items => {
  const found = []

  return items.reduce(
    (accum, queuedItem) => {
      let encoded

      if (queuedItem.action === 'request') {
        encoded = JSON.stringify(queuedItem.req)
      }

      if (queuedItem.action === 'subscribe') {
        encoded = queuedItem.path
      }

      if (found.indexOf(encoded) < 0) {
        accum.push(queuedItem)
      }

      return accum
    },
    []
  )
}

internals.createResponseActionPayload = (
  err,
  payload,
  statusCode,
  headers,
  req,
  resource
) => {
  const resActionPayload = {
    req: Object.assign({}, req, { resource }),
    statusCode,
    headers
  }

  if (err) {
    // payload on err will have bad data like `{ statusCode: 404 }` we don't want
    resActionPayload.error = err
  } else {
    resActionPayload.data = payload
  }

  return resActionPayload
}
