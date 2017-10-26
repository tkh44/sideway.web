import { handleActions } from 'redux-actions'
import { createApiAction, getResourceId, resToState } from 'api'

export const CREATE_PAGE = 'page/CREATE_PAGE'
export const GET_PAGE = 'page/GET_PAGE'
export const PATCH_PAGE = 'page/PATCH_PAGE'
export const DELETE_PAGE = 'page/DELETE_PAGE'
export const PUT_ROOM = 'page/PUT_ROOM'
export const PATCH_ROOM = 'page/PATCH_ROOM'
export const DELETE_ROOM = 'page/DELETE_ROOM'
export const PAGE_LIST = 'page/PAGE_LIST'
export const UPDATE_ROOM_POSITION = 'page/UPDATE_ROOM_POSITION'
export const pageActions = {}

pageActions.create = createApiAction(CREATE_PAGE, payload => ({
  path: '/page',
  method: 'POST',
  payload
}))
pageActions.get = createApiAction(GET_PAGE, id => `/page/${id}`)
pageActions.patch = createApiAction(PATCH_PAGE, (id, payload) => ({
  path: `/page/${id}`,
  method: 'PATCH',
  payload
}))
pageActions.delete = createApiAction(DELETE_PAGE, id => `/page/${id}`)

pageActions.putRoom = createApiAction(PUT_ROOM, (pageId, roomId, payload) => {
  return { path: `/page/${pageId}/room/${roomId}`, method: 'PUT', payload }
})

pageActions.patchRoom = createApiAction(
  PATCH_ROOM,
  (pageId, roomId, payload) => {
    return { path: `/page/${pageId}/room/${roomId}`, method: 'PATCH', payload }
  }
)

pageActions.deleteRoom = createApiAction(DELETE_ROOM, (pageId, roomId) => {
  return { path: `/page/${pageId}/room/${roomId}`, method: 'DELETE' }
})

pageActions.list = createApiAction(PAGE_LIST, '/pages')

pageActions.changeRoomListPosition = (pageId, dragId, hoverId, direction) => {
  return {
    type: UPDATE_ROOM_POSITION,
    payload: { pageId, dragId, hoverId, direction }
  }
}

export const initialState = {
  /**
   [pageId]: { ..data }
   */
}

export default handleActions(
  {
    [pageActions.create]: (state, action) => {
      if (action.payload) {
        const pageId = getResourceId(action)

        return {
          ...state,
          [pageId]: resToState(state[pageId], action)
        }
      }

      return state
    },
    [pageActions.get]: (state, action) => {
      const pageId = getResourceId(action)
      return {
        ...state,
        [pageId]: resToState(state[pageId], action)
      }
    },
    [pageActions.patch]: resToState,
    [pageActions.delete]: resToState,
    [pageActions.putRoom]: resToState,
    [pageActions.patchRoom]: resToState,
    [pageActions.deleteRoom]: resToState,
    [pageActions.list]: (state, action) =>
      resToState(state, action, 'id', false),
    [UPDATE_ROOM_POSITION]: (state, { payload }) => {
      const { pageId, dragId, hoverId, direction } = payload
      const page = state[pageId]
      const hoverRoom = page.rooms[hoverId]

      return {
        ...state,
        [pageId]: {
          ...state[pageId],
          rooms: {
            ...state[pageId].rooms,
            [dragId]: {
              ...state[pageId].rooms[dragId],
              priority: hoverRoom.priority + direction,
              section: hoverRoom.section
            }
          }
        }
      }
    }
  },
  initialState
)
