/* eslint-env serviceworker */
import { createAction, handleActions } from 'redux-actions'
import { api } from 'api'
import { encodeNotificationSub } from 'utils/hawk'
import { LOGOUT } from 'redux/auth'

const supportsPushNotifications = () =>
  'serviceWorker' in navigator && // has service worker
  'showNotification' in ServiceWorkerRegistration.prototype && // notifications supported by service worker
  'PushManager' in window && // Push messaging supported
  'Notification' in window // Notification permissions

const getNotificationPermission = () =>
  'Notification' in window ? window.Notification.permission : 'denied'

const getCurrentSubscription = async () => {
  const swReg = await navigator.serviceWorker.getRegistration('*')
  if (swReg) {
    return await swReg.pushManager.getSubscription()
  }
}

export const pushMiddleware = store =>
  next =>
    action => {
      if (action.type === LOGOUT) {
        // Stop getting push notifications once we log out
        store.dispatch(pushActions.endPushNotifications())
      }

      return next(action)
    }

export const pushActions = {}
pushActions.enablePushNotifications = createAction(
  'push/ENABLE_PUSH_NOTIFICATIONS'
)
pushActions.disablePushNotifications = createAction(
  'push/DISABLE_PUSH_NOTIFICATIONS'
)
pushActions.updatePermission = createAction('push/UPDATE_PERMISSION')

pushActions.startPushNotifications = (forceAskPermission = false) =>
  async (dispatch, getState) => {
    try {
      // Check on permissions and if we want to prompt the user for permission again
      if (
        !getState().push.support ||
        window.Notification.permission === 'denied' ||
        (forceAskPermission &&
          (await window.Notification.requestPermission()) !== 'granted')
      ) {
        dispatch(
          pushActions.disablePushNotifications({
            permission: getNotificationPermission()
          })
        )
        return
      }

      const swReg = await navigator.serviceWorker.getRegistration('*')

      if (swReg) {
        const pushSub = await swReg.pushManager.subscribe({
          userVisibleOnly: true
        })

        if (pushSub) {
          const { ok } = await api({
            method: 'POST',
            path: '/user/notifications',
            payload: pushSub
          })

          if (ok) {
            dispatch(
              pushActions.enablePushNotifications({
                sub: pushSub,
                permission: 'granted',
                support: true
              })
            )
            return pushSub
          }
        }
      } else {
        console.error('Service Worker Registration could not be found.')
      }
    } catch (err) {
      console.error(err)
    }

    dispatch(
      pushActions.disablePushNotifications({
        permission: getNotificationPermission()
      })
    )
  }

pushActions.endPushNotifications = () =>
  async (dispatch, getState) => {
    try {
      const pushSub = await getCurrentSubscription()

      console.log(pushSub)

      if (pushSub) {
        const didUnsub = await pushSub.unsubscribe()
        if (didUnsub) {
          dispatch(
            pushActions.disablePushNotifications({
              permission: getNotificationPermission()
            })
          )

          const { ok } = await api({
            method: 'DELETE',
            path: `/user/notifications/${encodeNotificationSub(pushSub)}`
          })

          console.log('unsub response ok:', ok)

          return didUnsub
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

export const initialState = {
  permission: getNotificationPermission(),
  support: supportsPushNotifications(),
  sub: undefined
}

export default handleActions(
  {
    [pushActions.enablePushNotifications]: (state, action) => {
      return {
        ...state,
        ...action.payload
      }
    },
    [pushActions.disablePushNotifications]: (state, action) => {
      return {
        ...state,
        sub: undefined,
        ...action.payload
      }
    },
    [pushActions.updatePermission]: (state, action) => {
      return {
        ...state,
        permission: action.payload,
        sub: action.payload !== 'granted' ? undefined : state.sub
      }
    }
  },
  initialState
)

export const setupPushState = store =>
  async () => {
    store.dispatch(
      pushActions.enablePushNotifications({
        sub: await getCurrentSubscription()
      })
    )
    pushPermissionListener(store)
  }

export const pushPermissionListener = async store => {
  const status = await navigator.permissions.query({ name: 'notifications' })
  store.dispatch(pushActions.updatePermission(status.state))
  status.onchange = function () {
    store.dispatch(pushActions.updatePermission(this.state))
  }
}
