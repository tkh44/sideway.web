import Hawk from 'hawk'
import { isEmpty } from 'lodash'
import ls from 'utils/localstorage'

if (!__TEST__) {
  Hawk.utils.setStorage(window.localStorage)
}

export const hawkNow = Hawk.utils.now

export const isValid = ticket => !!getTicketStatus(ticket).valid

export const getTicketStatus = ticket => {
  if (isEmpty(ticket) || ticket.app !== window.sideway.hawk.app.id) {
    return { exists: false, valid: false, renewalRequired: false }
  }

  const expired = ticket.exp <= hawkNow()

  return { exists: true, valid: !expired, renewalRequired: expired }
}

export const secureNesConnection = (
  host = window.sideway.server.api,
  ticket = {},
  options = {}
) => {
  const securedOptions = Object.assign({}, options)

  if (ticket) {
    securedOptions.auth = hawkAuthForPath(ticket, `${host}/nes/auth`, 'auth', {
      ext: `referrer=${encodeURIComponent(document.referrer)}`
    })
    securedOptions.auth.headers.host = `${host.replace('https://', '')}:443`
  }

  return securedOptions
}

export const hawkAuthForPath = (credentials, url, method, options) => {
  if (!credentials) {
    throw new SyntaxError('No credentials provided to hawk')
  }

  const header = Hawk.client.header(url, method, {
    credentials,
    app: window.sideway.hawk.app.id,
    ...options
  })

  return { headers: { Authorization: header.field } }
}

export const makeAuthCode = () => {
  const codeArray = new Uint8Array(16)
  window.crypto.getRandomValues(codeArray)
  const codeText = codeArray.join('').substr(0, 32)
  ls.setItem('code', codeText)
  return codeText
}

export const encodeNotificationSub = sub =>
  Hawk.crypto.utils.SHA256(sub.endpoint).toString()

// for debugging sessions
window.sideway = window.sideway || {}
Object.defineProperty(window.sideway, 'auth', {
  get () {
    const currentUserTicket = ls.getItem('userTicket') || {}
    return {
      app: currentUserTicket.app,
      id: Hawk.crypto.utils.SHA256(currentUserTicket.id).toString(),
      user: currentUserTicket.user
    }
  }
})
