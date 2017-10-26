import { createAction, handleActions } from 'redux-actions'
import { omit } from 'lodash'
import { noop } from 'utils/func'

const SHOW = 'sitrep/SHOW'
const DISMISS = 'sitrep/DISMISS'
const UPDATE = 'sitrep/UPDATE'
const CLEAR = 'sitrep/CLEAR'

const show = createAction(SHOW)
const dismiss = createAction(DISMISS)
const update = createAction(UPDATE)

let idCounter = 0

export const notify = opts => {
  const config = {
    id: String(++idCounter),
    message: '',
    type: 'info',
    duration: 4000,
    dismissible: true,
    onShow: noop,
    onHide: noop,
    ...opts
  }

  return dispatch => {
    if (config.duration > 0 && config.duration < Infinity) {
      config.timeoutId = setTimeout(
        () => {
          dispatch(dismiss(config.id))
        },
        config.duration
      )
    }

    dispatch(show(config))
  }
}

export const notifySuccess = options => {
  if (typeof options === 'string') {
    options = { message: options }
  }

  return dispatch => {
    dispatch(notify(Object.assign({ type: 'success' }, options)))
  }
}

export const notifyError = options => {
  if (typeof options === 'string') {
    options = { message: options }
  }

  return dispatch => {
    dispatch(notify(Object.assign({ type: 'error' }, options)))
  }
}

export const dismissNotification = id => {
  return { type: DISMISS, payload: id }
}

export const notifyOnDone = ({ successMessage, errorMessage }, dispatch) => {
  return err => {
    if (err) {
      return dispatch(notifyError({ message: errorMessage }))
    }

    dispatch(notifySuccess({ message: successMessage }))
  }
}

export const sitrep = {
  success: notifySuccess,
  error: notifyError,
  update,
  dismiss,
  notify
}

const initialState = {
  /**
   * [id]: { data }
   */
}

export default handleActions(
  {
    [SHOW]: (state, { payload }) => {
      return {
        ...state,
        [payload.id]: payload
      }
    },

    [DISMISS]: (state, { payload }) => {
      return omit({ ...state }, [payload])
    },

    [UPDATE]: (state, { payload }) => {
      return {
        ...state,
        [payload.id]: payload
      }
    },

    [CLEAR]: state => {
      return initialState
    }
  },
  initialState
)
