import Queue from 'promise-queue'
import { api } from 'api'
import { get, omit } from 'lodash'
import { getTicketStatus } from 'utils/hawk'
import { authActions } from 'redux/auth'

export const requestMiddleware = store => {
  const queue = new Queue(1, 10)

  return next => {
    return action => {
      if (!action.request) {
        return next(action)
      }

      const state = store.getState()
      const requestTicket = get(action, 'meta.ticket') ||
        state.auth.user ||
        state.auth.app
      const finalReqObj = typeof action.request === 'string'
        ? { path: action.request, method: 'GET' }
        : action.request

      const handleRequestSuccess = res => {
        next({
          ...omit(action, 'request'),
          payload: res.data,
          meta: {
            ...action.meta,
            fetching: false,
            request: finalReqObj,
            response: res
          }
        })

        return res
      }

      const handleRequestError = errRes => {
        const errorMeta = {
          ...action.meta,
          fetching: false,
          request: finalReqObj,
          response: omit(errRes, 'data')
        }

        if (errRes instanceof Error) {
          errorMeta.response = {
            status: 0,
            ok: false,
            statusText: errRes.message,
            data: errRes
          }
        }

        next({
          ...omit(action, 'request'),
          payload: errRes.data,
          meta: errorMeta
        })

        if (errRes instanceof Error) {
          return errorMeta.response
        }

        return errRes
      }

      store.dispatch({
        type: action.type,
        meta: {
          fetching: true,
          request: finalReqObj
        }
      })

      const makeRequest = () => {
        const newState = store.getState()
        const validTicket = newState.auth.user || newState.auth.app

        return api(action.request, validTicket)
          .then(handleRequestSuccess)
          .catch(handleRequestError)
      }

      if (getTicketStatus(requestTicket).renewalRequired) {
        if (queue.getQueueLength() === 0) {
          queue.maxPendingPromises = 1
          queue.add(() => {
            return store
              .dispatch(authActions.renewTicket(requestTicket))
              .then(renewedTicket => {
                queue.maxPendingPromises = 10
              })
          })
        }

        return queue.add(() => {
          return makeRequest()
        })
      }

      return makeRequest(requestTicket)
    }
  }
}
