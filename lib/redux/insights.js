import { createAction, handleActions } from 'redux-actions'

export const initialState = {
  /*
   [roomId]: {} // room data
   */
}

export const emptyInsight = {
  id: undefined,
  sessions: {},
  referrers: {}
}

export const insightActions = {}

insightActions.getRoom = createAction('insight/GET_ROOM')

insightActions.subUpdate = createAction('insight/SUB_UPDATE')

export default handleActions(
  {
    [insightActions.getRoom]: (state, { payload: { id, error, statusCode, payload } }) => {
      return {
        ...state,
        [id]: {
          ...state.id,
          ...(error ? { id } : payload)
        }
      }
    },
    [insightActions.subUpdate]: (state, { payload: { id, message } }) => {
      return {
        ...state,
        [id]: {
          ...state.id,
          ...message
        }
      }
    }
  },
  initialState
)
