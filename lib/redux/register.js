import { createAction, handleActions } from 'redux-actions'

const SET_REGISTRATION = 'register/SET_REGISTRATION'
const CLEAR_REGISTRATION = 'register/CLEAR_REGISTRATION'

export const registerActions = {
  setRegisterData: createAction(SET_REGISTRATION),
  clearRegisterData: createAction(CLEAR_REGISTRATION)
}

const initialState = {
  registerData: {}
}

export default handleActions(
  {
    [SET_REGISTRATION]: (state, action) => {
      return { ...state, registerData: action.payload }
    },
    [CLEAR_REGISTRATION]: (state, action) => {
      return { ...state, registerData: {} }
    }
  },
  initialState
)
