import { createAction, handleActions } from 'redux-actions'

const show = createAction('modal/SHOW')
const hide = createAction('modal/HIDE')

export const modalActions = { show, hide }

const initialState = {
  register: { isOpen: false, data: void 0 },
  login: { isOpen: false, data: void 0 }
}

export default handleActions(
  {
    [show]: (state, { payload }) => {
      return {
        ...state,
        [payload.modal]: {
          ...state[payload.modal],
          isOpen: true,
          data: payload.data
        }
      }
    },

    [hide]: (state, { payload }) => {
      if (!state[payload.modal]) {
        return { ...state, [payload.modal]: { isOpen: false, data: void 0 } }
      }

      return {
        ...state,
        [payload.modal]: {
          ...state[payload.modal],
          isOpen: false,
          data: state[payload.modal].data
        }
      }
    }
  },
  initialState
)
