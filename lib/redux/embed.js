import { handleActions } from 'redux-actions'
import { createApiAction, resToState, getResourceId } from 'api'

export const DESCRIBE = 'embed/DESCRIBE'

const formatEmbedUrl = url => {
  if (!(url.indexOf('http://') === 0 || url.indexOf('https://') === 0)) {
    url = 'unknown://' + url
  }

  return url
}

export const embedActions = {}

embedActions.describe = createApiAction(DESCRIBE, url => {
  const encodedUrl = formatEmbedUrl(url)

  return {
    base: window.sideway.server.embed,
    path: '/describe',
    query: { url: encodedUrl },
    method: 'GET',
    resource: url
  }
})

export const initialState = {
  /**
   [url]: { embed: [true|false], summary: { url, title, description, icon, site, image } }
   */
}

export default handleActions(
  {
    [DESCRIBE]: (state, action) => {
      const url = getResourceId(action, 'url')

      return {
        ...state,
        [url]: resToState(state[url], action)
      }
    }
  },
  initialState
)
