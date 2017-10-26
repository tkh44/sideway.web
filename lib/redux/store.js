import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import rootReducer from './reducer'
import { profileMiddleware } from 'redux/profile'
import { nesMiddleware } from 'redux/nes'
import { authMiddleware } from 'redux/auth'
import { requestMiddleware } from 'redux/request-middleware'
import { pushMiddleware } from 'redux/push'

const loggerFilter = (getState, action) => {
  const type = action.type && action.type.toLowerCase()
  return type &&
    !type.includes('scroll') &&
    !type.includes('change') &&
    !type.includes('invite/')
}

const actionTransformer = action => {
  if (action.meta && action.meta.request) {
    if (action.meta.response) {
      return Object.assign({}, action, {
        type: action.type + ':' + action.meta.response.status
      })
    }

    if (action.meta.response && action.meta.response.ok === false) {
      return Object.assign({}, action, {
        type: action.type + ':' + action.payload.data.message
      })
    }

    return Object.assign({}, action, {
      type: action.type + ':' + action.meta.request.method
    })
  }

  if (action.type === 'nes/ERROR') {
    return {
      ...action,
      type: action.type + ':' + action.payload.statusCode ||
        action.payload.message ||
        action.payload.type
    }
  }

  return action
}

export const configureStore = (
  initialState = {},
  extraMiddleware,
  thunkArgs
) => {
  if (!Array.isArray(extraMiddleware)) {
    extraMiddleware = [extraMiddleware]
  }

  let middleware

  const baseMiddleware = [
    thunkMiddleware.withExtraArgument(thunkArgs),
    requestMiddleware,
    nesMiddleware,
    authMiddleware,
    profileMiddleware,
    pushMiddleware,
    ...extraMiddleware
  ].filter(Boolean)

  if (__DEVELOPMENT__) {
    const { createLogger } = require('redux-logger')

    middleware = [
      ...baseMiddleware,
      createLogger({
        predicate: loggerFilter,
        collapsed: true,
        actionTransformer
      })
    ]
  } else {
    middleware = baseMiddleware
  }

  const createStoreWithMiddleware = compose(
    applyMiddleware(...middleware),
    __DEVELOPMENT__ && window.devToolsExtension
      ? window.devToolsExtension()
      : f => f
  )(createStore)

  const store = createStoreWithMiddleware(rootReducer, initialState)

  if (module.hot) {
    module.hot.accept('./reducer.js', () => {
      store.replaceReducer(require('./reducer.js').default)
    })
  }

  return store
}
