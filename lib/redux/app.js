import { createAction, handleActions } from 'redux-actions'

export const appActions = {
  updateAvailable: createAction('app/UPDATE_AVAILABLE')
}

const initialState = {
  server: {
    api: '',
    login: '',
    web: '',
    short: '',
    embed: ''
  },
  hawk: {
    app: {
      id: '',
      key: '',
      algorithm: ''
    }
  },
  version: '',
  swUpdateAvailable: false
}

export default handleActions(
  {
    [appActions.updateAvailable]: (state, { payload }) => {
      return {
        ...state,
        swUpdateAvailable: payload
      }
    }
  },
  initialState
)
