import { createAction, handleActions } from 'redux-actions'
import { get } from 'lodash'

export const roomUIActions = {
  highlightMessage: createAction('room-ui/HIGHLIGHT_MESSAGE'),
  removeHighlight: createAction('room-ui/REMOVE_HIGHLIGHT'),
  editMessage: createAction('room-ui/EDIT_MESSAGE'),
  collapseGroup: createAction('room-ui/COLLAPSE_GROUP'),
  expandGroup: createAction('room-ui/EXPAND_GROUP'),
  setCollapseState: createAction('room-ui/SET_COLLAPSE_STATE'),
  setInputFocus: createAction('room-ui/SET_INPUT_FOCUS'),
  setShowTopicInput: createAction('room-ui/SET_SHOW_TOPIC'),
  enableRoomIntro: createAction('room-ui/ENABLE_ROOM_INTRO'),
  disableRoomIntro: createAction('room-ui/DISABLE_ROOM_INTRO'),
  setRoomIntroStep: createAction('room-ui/SET_ROOM_INTRO_STEP'),
  setDeleteMessageId: createAction('room-ui/SET_DELETE_MESSAGE_ID'),
  showMarkdownModal: createAction('room-ui/SHOW_MARKDOWN_MODAL'),
  hideMarkdownModal: createAction('room-ui/HIDE_MARKDOWN_MODAL'),
  addUpload: (roomId, meta) => {
    return (dispatch) => {
      const payload = { roomId, meta }
      dispatch({ type: 'room-ui/ADD_UPLOAD', payload })
      return () => dispatch({ type: 'room-ui/REMOVE_UPLOAD', payload })
    }
  }
}

const START_FILE_UPLOAD = 'file-upload'

export const startFileupload = (upload, cb) => {
  return (dispatch) => {
    dispatch({ type: START_FILE_UPLOAD, upload })
    return cb(upload)
  }
}

const initialState = {
  /*
  [roomId]: {
    highlightedMessageId: [id]
    editingMessageId: [id],
    collapsed: {
      [commentId]: true|false
    }
  }
  */
}

export default handleActions(
  {
    [roomUIActions.highlightMessage]: (state, { payload }) => {
      const { roomId, messageId } = payload
      return {
        ...state,
        [roomId]: {
          ...state[roomId],
          highlightedMessageId: messageId
        }
      }
    },
    [roomUIActions.removeHighlight]: (state, { payload }) => {
      const { roomId, messageId } = payload

      if (state[roomId].highlightedMessageId !== messageId) {
        return state
      }

      return {
        ...state,
        [roomId]: {
          ...state[roomId],
          highlightedMessageId: undefined
        }
      }
    },
    [roomUIActions.editMessage]: (state, { payload }) => {
      const { roomId, messageId } = payload
      return {
        ...state,
        [roomId]: {
          ...state[roomId],
          editingMessageId: messageId
        }
      }
    },
    [roomUIActions.collapseGroup]: (state, { payload }) => {
      const { roomId, commentId } = payload
      return {
        ...state,
        [roomId]: {
          ...state[roomId],
          collapsed: {
            ...state[roomId].collapsed,
            [commentId]: true
          }
        }
      }
    },
    [roomUIActions.expandGroup]: (state, { payload }) => {
      const { roomId, commentId } = payload
      return {
        ...state,
        [roomId]: {
          ...state[roomId],
          collapsed: {
            ...state[roomId].collapsed,
            [commentId]: false
          }
        }
      }
    },
    [roomUIActions.setCollapseState]: (state, { payload }) => {
      const { roomId, collapsed } = payload
      return {
        ...state,
        [roomId]: {
          ...state[roomId],
          collapsed: {
            ...state[roomId].collapsed,
            ...collapsed
          }
        }
      }
    },
    [roomUIActions.setInputFocus]: (state, { payload }) => {
      const { roomId, inputFocused } = payload
      return {
        ...state,
        [roomId]: {
          ...state[roomId],
          inputFocused
        }
      }
    },
    [roomUIActions.setShowTopicInput]: (state, { payload }) => {
      const { roomId, showTopicInput } = payload
      return {
        ...state,
        [roomId]: {
          ...state[roomId],
          showTopicInput
        }
      }
    },
    [roomUIActions.enableRoomIntro]: (state, { payload }) => {
      const { roomId } = payload
      return {
        ...state,
        [roomId]: {
          ...state[roomId],
          intro: {
            step: get(state[roomId], 'intro.step', 1),
            enabled: true
          }
        }
      }
    },
    [roomUIActions.disableRoomIntro]: (state, { payload }) => {
      const { roomId } = payload
      return {
        ...state,
        [roomId]: {
          ...state[roomId],
          intro: {
            step: get(state[roomId], 'intro.step'),
            enabled: false
          }
        }
      }
    },
    [roomUIActions.setRoomIntroStep]: (state, { payload }) => {
      const { roomId, step } = payload
      return {
        ...state,
        [roomId]: {
          ...state[roomId],
          intro: {
            enabled: get(state[roomId], 'intro.enabled'),
            step
          }
        }
      }
    },
    [roomUIActions.setDeleteMessageId]: (state, { payload }) => {
      const { roomId, messageId } = payload
      return {
        ...state,
        [roomId]: {
          ...state[roomId],
          deleteMessageId: messageId
        }
      }
    },
    [roomUIActions.showMarkdownModal]: (state, { payload: roomId }) => {
      return {
        ...state,
        [roomId]: {
          ...state[roomId],
          showMarkdownModal: true
        }
      }
    },
    [roomUIActions.hideMarkdownModal]: (state, { payload: roomId }) => {
      return {
        ...state,
        [roomId]: {
          ...state[roomId],
          showMarkdownModal: false
        }
      }
    },
    'room-ui/ADD_UPLOAD': (state, { payload: { roomId, meta } }) => {
      return {
        ...state,
        [roomId]: {
          ...state[roomId],
          uploads: ((state[roomId] || {}).uploads || []).slice(0).concat([meta])
        }
      }
    },
    'room-ui/REMOVE_UPLOAD': (state, { payload: { roomId, meta } }) => {
      return {
        ...state,
        [roomId]: {
          ...state[roomId],
          uploads: state[roomId].uploads.filter(m => m !== meta)
        }
      }
    }
  },
  initialState
)
