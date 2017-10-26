import { handleActions } from 'redux-actions'
import { LOGOUT } from 'redux/auth'
import { createApiAction, resToState } from 'api'

export const GET_NOTIFY = 'room-notify/GET'
export const POST_NOTIFY = 'room-notify/POST'
export const DELETE_NOTIFY = 'room-notify/DELETE'

export const roomNotifyActions = {}
roomNotifyActions.getByRoomId = createApiAction(GET_NOTIFY, roomId => ({
  method: 'GET',
  path: `/room/${roomId}/notify`,
  resource: roomId
}))

roomNotifyActions.setNotifyByRoomId = createApiAction(POST_NOTIFY, roomId => ({
  method: 'POST',
  path: `/room/${roomId}/notify`,
  resource: roomId
}))

roomNotifyActions.deleteNotifyByRoomId = createApiAction(
  DELETE_NOTIFY,
  roomId => ({
    method: 'DELETE',
    path: `/room/${roomId}/notify`,
    resource: roomId
  })
)

const initialState = {
  /* [roomId]: true|false */
}

export default handleActions(
  {
    [GET_NOTIFY]: (state, action) => {
      const roomId = action.meta.request.resource
      return {
        ...state,
        [roomId]: resToState(state[roomId], action, 'room', true)
      }
    },
    [POST_NOTIFY]: (state, action) => {
      const roomId = action.meta.request.resource

      return {
        ...state,
        [roomId]: {
          ...resToState(state[roomId], action, 'room', true),
          subscribed: action.meta.fetching ? true : action.meta.response.ok,
          room: roomId
        }
      }
    },
    [DELETE_NOTIFY]: (state, action) => {
      const roomId = action.meta.request.resource

      return {
        ...state,
        [roomId]: {
          ...resToState(state[roomId], action, 'room', true),
          subscribed: action.meta.fetching ? false : !action.meta.response.ok,
          room: roomId
        }
      }
    },
    [LOGOUT]: () => initialState
  },
  initialState
)
