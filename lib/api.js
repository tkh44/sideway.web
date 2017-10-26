import fetch from 'unfetch/src/index' // we don't want or need the ponyfill
import Hawk from 'hawk'
import { merge, get } from 'lodash'
import ls from 'utils/localstorage'
import { queryString } from 'utils/string'

// strips authentication from loggly headers
const headersToObj = headers => {
  if (!headers) {
    return {}
  }

  const out = {}
  for (const name of headers) {
    if (name === 'authorization') {
      continue
    }
    out[name] = headers[name]
  }
  return out
}

const logToLoggly = (req, res) => {
  return

  // if (res && res.status && res.status === 404) {
  //   return
  // }
  //
  // if (window._LTracker) {
  //   // push to loggly
  //   window._LTracker.push({
  //     event: 'request',
  //     timestamp: Hawk.utils.now(),
  //     location: window.location,
  //     request: {
  //       ...req,
  //       headers: headersToObj(req.headers)
  //     },
  //     response: {
  //       ...res,
  //       headers: headersToObj(res.headers)
  //     },
  //     auth: window.sideway.auth,
  //     tags: ['client']
  //   })
  // }
}

export const getTicket = () => {
  return ls.getItem('userTicket') || ls.getItem('appTicket')
}

const buildRequest = (fullUrl, req, ticket, hawkHeader) => {
  const headers = {}

  if (get(hawkHeader, 'field')) {
    headers['Authorization'] = hawkHeader.field
  }

  if (req.headers) {
    Object.keys(req.headers).forEach(key => {
      headers[key] = req.headers[key]
    })
  }

  const requestOptions = {
    method: req.method,
    redirect: 'follow',
    headers
  }

  if (req.payload instanceof window.FormData) {
    requestOptions.body = req.payload
  } else {
    headers['Content-Type'] = 'application/json'
    requestOptions.body = JSON.stringify(req.payload)
  }

  return { fullUrl, requestOptions }
}

export const api = async function api (req, ticket = getTicket()) {
  if (typeof req === 'string') {
    req = { path: req, method: 'GET' }
  }

  if (!req.base) {
    req.base = window.sideway.server.api
  }

  const query = queryString(req.query)
  const fullUrl = req.base + req.path + `${query ? '?' + query : ''}`

  const hawkHeader = ticket
    ? Hawk.client.header(fullUrl, req.method, {
      credentials: ticket,
      app: get(ticket, 'app')
    })
    : Hawk.client.header(fullUrl, req.method, {
      credentials: null,
      app: window.sideway.hawk.app.id
    })

  const { requestOptions } = buildRequest(fullUrl, req, ticket, hawkHeader)
  let response
  let json

  try {
    response = await fetch(fullUrl, requestOptions)
  } catch (err) {
    __DEVELOPMENT__ && console.log('Response error', err)
    logToLoggly({ url: fullUrl, ...requestOptions }, {
      status: 0,
      ok: false,
      statusText: err.message,
      data: err
    })
    throw err
  }

  if (response.status === 401) {
    Hawk.client.authenticate(response, ticket, hawkHeader.artifacts)

    const syncedHawkHeader = Hawk.client.header(fullUrl, req.method, {
      credentials: ticket,
      app: window.sideway.hawk.app.id
    })

    try {
      __DEVELOPMENT__ &&
        console.log(
          'Making request with synced hawk headers: ',
          req.method,
          req.path
        )
      response = await fetch(
        fullUrl, buildRequest(fullUrl, req, ticket, syncedHawkHeader).requestOptions
      )
    } catch (err) {
      __DEVELOPMENT__ && console.log('Response error', err)
      logToLoggly({ url: fullUrl, ...requestOptions }, {
        status: 0,
        ok: false,
        statusText: err.message,
        data: err
      })
      throw err
    }
  }

  try {
    json = await response.json()
    response.data = json
  } catch (err) {
    response.data = null
  }

  if (!response.ok) {
    logToLoggly({ url: fullUrl, ...requestOptions }, response)
  }

  return response
}

export const createApiAction = (actionType, request) => {
  const actionHandler = (...args) => {
    return (dispatch, getState) => {
      const { auth } = getState()
      const ticket = auth.user || auth.app

      return dispatch({
        type: actionType,
        request: typeof request === 'function' ? request(...args) : request,
        meta: {
          ticket
        }
      })
    }
  }

  actionHandler.toString = () => actionType.toString()

  return actionHandler
}

export const parseResourceFromPath = (url = '') =>
  url.split('/').pop().split('?')[0]

export const getResourceId = ({ payload, meta }, key = 'id') => {
  if (payload && payload[key]) {
    return payload[key]
  }

  if (get(meta.request, 'resource', false)) {
    return meta.request.resource
  }

  return parseResourceFromPath(meta.request.path)
}

export function resToState (state, action, idKey = 'id', includedMeta = true) {
  const { payload, meta: { fetching, response = {} } = {} } = action

  let finalData = response.ok && !fetching && payload ? payload : {}

  if (Array.isArray(finalData)) {
    finalData = finalData.reduce(
      (collect, item) => {
        collect[item[idKey]] = { ...state[item[idKey]], ...item }
        return collect
      },
      {}
    )
  }

  const nextState = merge({}, state, finalData)

  if (includedMeta) {
    nextState.$$meta = {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      fetching
    }
  }

  return nextState
}
