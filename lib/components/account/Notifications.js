import { get } from 'lodash'
import compose from 'recompose/compose'
import withHandlers from 'recompose/withHandlers'
import ProfileSection from 'account/ProfileSection'
import Toggle from 'ui/Toggle'
import { encodeNotificationSub } from 'utils/hawk'
import { pushActions } from 'redux/push'

const getToggleState = (sub, profileNotifications) => {
  if (!sub) return false
  return get(profileNotifications, encodeNotificationSub(sub), false)
}

const Notifications = compose(
  withHandlers({
    onNotificationToggle: ({ dispatch, push }) =>
      () => {
        if (push.sub) {
          return dispatch(pushActions.endPushNotifications())
        }
        return dispatch(pushActions.startPushNotifications(true))
      }
  })
)(({ push, dispatch, onNotificationToggle, profile }) => {
  const { sub, permission, support } = push
  let label

  if (permission !== 'denied') {
    label = 'Enable push notifications'
  } else {
    label = 'Notifications are blocked'
  }

  return (
    <ProfileSection title='Notifications' showTopBorder>
      <Toggle
        value={getToggleState(sub, get(profile, 'notifications', {}))}
        onChange={onNotificationToggle}
        label={label}
        disabled={!support || permission === 'denied'}
      />
    </ProfileSection>
  )
})

export default Notifications
