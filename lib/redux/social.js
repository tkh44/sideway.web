import { handleActions } from 'redux-actions'
import { merge, omit, get } from 'lodash'
import { participantsToUsers } from 'selectors/rooms'
import { createApiAction, resToState, getResourceId } from 'api'

export const ABOUT = 'social/ABOUT'

export const socialActions = {}

socialActions.about = createApiAction(
  ABOUT,
  (account, type = 'username', minimal = false) => {
    return {
      path: `/about/${type}/${account}`,
      query: { minimal },
      method: 'GET'
    }
  }
)

export const initialState = {
  /**
   [userId]: userProfile
   */
}

export default handleActions(
  {
    [ABOUT]: (state, action) => {
      const username = getResourceId(action, 'username')
      const nextUsernameState = resToState(state[username], action)
      const list = get(action, 'meta.response.ok')
        ? get(nextUsernameState, 'list', []).map(room => room.id)
        : get(state[username], 'list')

      return {
        ...state,
        [username]: {
          ...nextUsernameState,
          list
        }
      }
    },
    'room/GET_ROOM': (state, action) => {
      if (action.meta && action.meta.response && action.meta.response.ok) {
        const users = participantsToUsers(action.payload)

        const nextState = users.reduce(
          (accum, user) => {
            if (user.username) {
              accum[user.username] = merge(
                {},
                state[user.username],
                omit(user, ['disabled', 'activity'])
              )
            }

            return accum
          },
          {}
        )

        return {
          ...state,
          ...nextState
        }
      }

      return state
    }
  },
  initialState
)
