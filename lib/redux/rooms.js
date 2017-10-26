import { handleActions } from 'redux-actions'
import { isObject, get, merge } from 'lodash'
import { hawkNow } from 'utils/hawk'
import { actions as nesActions } from 'redux/nes'
import { ABOUT } from 'redux/social'
import { createApiAction, resToState, getResourceId } from 'api'

export const initialState = {
  /*
   [roomId]: { id, messages, ..., $$meta: { fetching, error, headers, statusCode, ...} // room data
   */
}

export const ACTIVITY_UPDATE = 'room/ACTIVITY_UPDATE'
export const UPLOAD_MESSAGE_IMAGE = 'room/UPLOAD_MESSAGE_IMAGE'
export const PUBLISH_MEDIUM = 'room/PUBLISH_MEDIUM'
export const PUBLISH_MARKDOWN = 'room/PUBLISH_MARKDOWN'
export const ADD_PARTICIPANT = 'room/ADD_PARTICIPANT'
export const CREATE_ROOM = 'room/CREATE_ROOM'
export const DELETE_ROOM = 'room/DELETE_ROOM'
export const GET_ROOM = 'room/GET_ROOM'
export const ROOM_LIST = 'room/ROOM_LIST'
export const PATCH_ROOM = 'room/PATCH_ROOM'
export const PUT_TOPIC = 'room/PUT_TOPIC'
export const REMOVE_PARTICIPANT = 'room/REMOVE_PARTICIPANT'
export const REQUEST_TO_JOIN = 'room/REQUEST_TO_JOIN'
export const REJECT_JOIN_REQUEST = 'room/REJECT_JOIN_REQUEST'
export const CANCEL_JOIN_REQUEST = 'room/CANCEL_JOIN_REQUEST'
export const ADD_COMMENT = 'room/ADD_COMMENT'
export const APPROVE_COMMENT = 'room/APPROVE_COMMENT'
export const REJECT_COMMENT = 'room/REJECT_COMMENT'
export const DELETE_POSTED_COMMENT = 'room/DELETE_POSTED_COMMENT'
export const DELETE_PENDING_COMMENT = 'room/DELETE_PENDING_COMMENT'
export const TOGGLE_PENDING_COMMENT_REACTION = 'room/TOGGLE_PENDING_COMMENT_REACTION'
export const PATCH_MESSAGE = 'room/PATCH_MESSAGE'
export const DELETE_MESSAGE = 'room/DELETE_MESSAGE'
export const TOGGLE_POSTED_COMMENT_REACTION = 'room/TOGGLE_POSTED_COMMENT_REACTION'
export const UPDATE_MSG_TEXT = 'room/UPDATE_MSG_TEXT'
export const TOGGLE_MSG_COMMENT = 'room/TOGGLE_MSG_COMMENT'
export const SUB_UPDATE = 'room/SUB_UPDATE'

export const roomActions = {}

roomActions.createRoom = createApiAction(CREATE_ROOM, payload => {
  if (typeof payload === 'string') {
    payload = {
      about: payload,
      status: 'pending'
    }
  }

  return { path: '/room', method: 'POST', payload }
})

roomActions.getRoomById = createApiAction(GET_ROOM, id => `/room/${id}`)

roomActions.getRoomList = createApiAction(ROOM_LIST, () => '/rooms')

roomActions.patchRoom = createApiAction(PATCH_ROOM, (id, payload) => ({
  method: 'PATCH',
  path: `/room/${id}`,
  payload
}))

roomActions.deleteRoom = createApiAction(DELETE_ROOM, id => ({
  method: 'DELETE',
  path: `/room/${id}`
}))

roomActions.putTopic = createApiAction(PUT_TOPIC, (id, topic = '') => ({
  method: 'PUT',
  path: `/room/${id}/topic`,
  payload: { message: topic }
}))

roomActions.addParticipantById = createApiAction(
  ADD_PARTICIPANT,
  (roomId, id, type = 'sideway') => {
    return {
      path: `/room/${roomId}/participants`,
      method: 'POST',
      payload: { participants: [{ type, id }] }
    }
  }
)

roomActions.addParticipantByUsername = createApiAction(
  ADD_PARTICIPANT,
  (roomId, username, type = 'sideway') => {
    return {
      path: `/room/${roomId}/participants`,
      method: 'POST',
      payload: { participants: [{ type, username }] }
    }
  }
)

roomActions.removeParticipant = createApiAction(
  REMOVE_PARTICIPANT,
  (roomId, participantId) => {
    return {
      method: 'DELETE',
      path: `/room/${roomId}/participant/${participantId}`
    }
  }
)

roomActions.requestToJoin = createApiAction(
  REQUEST_TO_JOIN,
  (roomId, message) => {
    const req = { method: 'POST', path: `/room/${roomId}/request` }

    if (message) {
      req.payload = { message }
    }

    return req
  }
)

roomActions.rejectJoinRequest = createApiAction(
  REJECT_JOIN_REQUEST,
  (roomId, userId) => ({
    method: 'DELETE',
    path: `/room/${roomId}/request/${userId}`
  })
)

roomActions.cancelJoinRequest = createApiAction(
  CANCEL_JOIN_REQUEST,
  roomId => ({
    method: 'DELETE',
    path: `/room/${roomId}/request`
  })
)

roomActions.addComment = createApiAction(
  ADD_COMMENT,
  (roomId, comment, imageFile) => {
    const formData = new window.FormData()
    if (imageFile) {
      formData.append('image', imageFile)
    }
    formData.append('text', comment)
    return {
      method: 'POST',
      path: `/room/${roomId}/comment`,
      payload: formData,
      resource: roomId
    }
  }
)

roomActions.approveComment = createApiAction(
  APPROVE_COMMENT,
  (roomId, commentId) => {
    return {
      method: 'POST',
      path: `/room/${roomId}/comment/${commentId}`,
      payload: { action: 'approve' },
      resource: roomId
    }
  }
)

roomActions.rejectComment = createApiAction(
  REJECT_COMMENT,
  (roomId, commentId) => {
    return {
      method: 'POST',
      path: `/room/${roomId}/comment/${commentId}`,
      payload: { action: 'reject' },
      resource: roomId
    }
  }
)

roomActions.deletePendingComment = createApiAction(
  DELETE_PENDING_COMMENT,
  (roomId, commentId) => {
    return {
      method: 'DELETE',
      path: `/room/${roomId}/comment/${commentId}`,
      resource: roomId,
      commentId
    }
  }
)

roomActions.togglePendingCommentReaction = createApiAction(
  TOGGLE_PENDING_COMMENT_REACTION,
  (roomId, commentId, isReaction) => {
    return {
      method: 'PATCH',
      path: `/room/${roomId}/comment/${commentId}`,
      payload: { reaction: isReaction },
      resource: roomId
    }
  }
)

roomActions.patchMessage = createApiAction(
  PATCH_MESSAGE,
  (roomId, messageId, payload) => {
    return {
      method: 'PATCH',
      path: `/room/${roomId}/message/${messageId}`,
      payload,
      resource: roomId
    }
  }
)

roomActions.deleteMessage = createApiAction(
  DELETE_MESSAGE,
  (roomId, messageId) => {
    return {
      method: 'DELETE',
      path: `/room/${roomId}/message/${messageId}`,
      resource: roomId
    }
  }
)

roomActions.uploadMessageImage = createApiAction(
  UPLOAD_MESSAGE_IMAGE,
  (roomId, imageFile) => {
    const formData = new window.FormData()
    formData.append('image', imageFile)

    return {
      method: 'POST',
      path: `/room/${roomId}/activity/image`,
      payload: formData,
      resource: roomId
    }
  }
)

roomActions.publishToMedium = createApiAction(
  PUBLISH_MEDIUM,
  (roomId, publicationId) => {
    const req = {
      method: 'POST',
      path: `/room/${roomId}/publish/medium`,
      resource: roomId
    }

    if (publicationId) {
      req.query = { publicationId }
    }

    return req
  }
)

roomActions.publishMarkdown = createApiAction(PUBLISH_MARKDOWN, id => `/room/${id}/publish/markdown`)

roomActions.updateActivity = (userId, roomId, payload, cb = () => {}) => {
  return dispatch => {
    const req = { path: `/room/${roomId}/activity`, method: 'POST', payload }

    const done = (err, res) => {
      if (err) {
        if (err.data && err.data.activity) {
          dispatch({
            type: ACTIVITY_UPDATE,
            payload: { data: err.data.activity, roomId, userId }
          })
        }

        return cb(err)
      }

      dispatch({
        type: ACTIVITY_UPDATE,
        payload: { data: res, roomId, userId }
      })

      return cb(err, res)
    }

    dispatch(nesActions.request(req, 'room/ACTIVITY_REQUEST', done))
  }
}

const mergeComplex = (room, roomUpdate, keyToUpdate) => {
  const fieldToUpdate = roomUpdate[keyToUpdate] || {}

  return Object.keys(fieldToUpdate).reduce(
    (nextRoom, id) => {
      if (fieldToUpdate[id] === null) {
        // Item was removed on server
        return {
          ...nextRoom,
          [keyToUpdate]: {
            ...nextRoom[keyToUpdate],
            [id]: null
          }
        }
      }

      return {
        ...nextRoom,
        [keyToUpdate]: {
          ...nextRoom[keyToUpdate],
          [id]: {
            ...nextRoom[keyToUpdate][id],
            ...fieldToUpdate[id]
          }
        }
      }
    },
    room
  )
}

export const emptyRoom = {
  activity: {},
  description: '',
  id: null,
  limits: {},
  messages: {},
  participants: {},
  requests: {},
  system: {},
  title: '',
  update: { created: Date.now() }
}

export default handleActions(
  {
    [CREATE_ROOM]: (state, action) => {
      if (action.payload) {
        const roomId = getResourceId(action)

        return {
          ...state,
          [roomId]: resToState(state[roomId], action)
        }
      }

      return state
    },

    [GET_ROOM]: (state, action) => {
      const roomId = getResourceId(action)
      const room = { ...emptyRoom, ...state[roomId] } // If this is the first fetch for the room fill in missing fields.

      return {
        ...state,
        [roomId]: {
          ...room,
          ...resToState(room, action)
        }
      }
    },

    [ROOM_LIST]: (state, action) => {
      return resToState(state, action, 'id', false) // We catch the meta data in the profile reducer
    },

    [DELETE_ROOM]: (state, action) => {
      if (action.meta.response && action.meta.response.ok) {
        const roomId = getResourceId(action)

        return {
          ...state,
          [roomId]: emptyRoom
        }
      }

      return state
    },

    [PUBLISH_MARKDOWN]: (state, action) => {
      if (action.meta.response && action.meta.response.ok) {
        const roomId = getResourceId(action)

        return {
          ...state,
          [roomId]: {
            ...state[roomId],
            markdown: resToState(state[roomId].markdown, action)
          }
        }
      }

      return state
    },

    [SUB_UPDATE]: (state, action) => {
      const { message: roomUpdate } = action.payload
      const roomId = roomUpdate.id

      const nextRoom = Object.keys(roomUpdate).reduce(
        (room, key) => {
          if (key === 'id') {
            return room
          }

          if (key === 'system') {
            // We need to write system only
            return {
              ...room,
              [key]: merge({}, room[key], roomUpdate[key])
            }
          }

          if (key === 'links') {
            let updatedLinks = roomUpdate[key]
            if (isObject(updatedLinks)) {
              updatedLinks = Object.keys(updatedLinks).map(
                k => updatedLinks[k]
              )
            }
            return {
              ...room,
              links: updatedLinks || []
            }
          }

          if (key === 'messages' || key === 'pending') {
            return mergeComplex(room, roomUpdate, key)
          }

          let deepUpdate

          if (isObject(room[key])) {
            deepUpdate = merge({}, room[key], roomUpdate[key])
          } else {
            deepUpdate = roomUpdate[key]
          }

          return {
            ...room,
            [key]: deepUpdate,
            system: {
              ...room.system,
              last: key === 'activity' ? hawkNow() : get(room, 'system.last')
            }
          }
        },
        state[roomId] || { ...emptyRoom }
      )

      return {
        ...state,
        [roomId]: nextRoom
      }
    },

    [ACTIVITY_UPDATE]: (state, { payload }) => {
      const { data, roomId, userId } = payload

      return {
        ...state,
        [roomId]: {
          ...state[roomId],
          activity: {
            ...state[roomId].activity,
            [userId]: data
          }
        }
      }
    },

    [ABOUT]: (state, action) => {
      const roomList = get(action, 'payload.list')

      if (roomList) {
        return roomList.reduce(
          (nextState, room) => {
            return {
              ...nextState,
              [room.id]: {
                ...state[room.id],
                ...room
              }
            }
          },
          state
        )
      }

      return state
    }
  },
  initialState
)
