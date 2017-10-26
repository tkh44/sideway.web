import * as params from 'query-params'

export const queryString = params.encode

export const decodeQueryString = string => {
  if (string.charAt(0) === '?') {
    string = string.slice(1)
  }
  return params.decode(string)
}

export function compareString (
  before = '',
  current = '',
  limit = before.length
) {
  let i = 0
  for (; i < Math.min(limit, before.length); ++i) {
    if (before[i] !== current[i]) {
      return i
    }
  }

  return i
}

export function parseUrl (url) {
  const a = document.createElement('a')
  a.href = url

  return {
    href: a.href,
    protocol: a.protocol,
    host: a.host,
    hostname: a.hostname,
    port: a.port,
    pathname: a.pathname,
    search: a.search,
    hash: a.hash,
    origin: a.origin
  }
}
