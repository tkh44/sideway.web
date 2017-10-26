import { Component } from 'react'
import { connect } from 'react-redux'
import { css, StyleSheet } from 'aphrodite/no-important'
import { animation, colors } from 'style'
import Toggle from 'ui/Toggle'
import { pushActions } from 'redux/push'
import { roomNotifyActions } from 'redux/room-notify'

const makeMapStateToProps = (initialState, initialProps) => {
  const { roomId } = initialProps

  return state => {
    return {
      push: state.push,
      roomNotify: state.roomNotify[roomId] || {
        subscribed: false,
        $$meta: { ok: undefined }
      }
    }
  }
}

export default connect(makeMapStateToProps)(
  class RoomNotifyStartToggle extends Component {
    componentDidMount () {
      const { dispatch, roomId } = this.props
      dispatch(roomNotifyActions.getByRoomId(roomId))
    }

    render () {
      const {
        push,
        roomNotify
      } = this.props
      return (
        <div
          className={css(
            styles.notifyToggle,
            roomNotify.$$meta.fetching && styles.fetching
          )}
        >
          {roomNotify.$$meta.ok === false &&
            <div
              style={{
                color: colors.red
              }}
            >
              {
                `There was an error ${roomNotify.subscribed ? 'unsubscribing from' : 'subscribing  to'} notifications.`
              }
            </div>}
          <Toggle
            value={roomNotify.subscribed}
            onChange={this.handleNotificationToggle}
            label={
              push.permission === 'denied'
                ? 'Notifications are blocked'
                : 'Notify me when this converstation starts'
            }
            disabled={
              push.permission === 'denied' || roomNotify.$$meta.fetching
            }
          />
        </div>
      )
    }

    handleNotificationToggle = async () => {
      const { dispatch, roomId, roomNotify } = this.props

      if (roomNotify.subscribed) {
        return await dispatch(roomNotifyActions.deleteNotifyByRoomId(roomId))
      }

      const subscription = await dispatch(pushActions.startPushNotifications())
      if (subscription) {
        await dispatch(roomNotifyActions.setNotifyByRoomId(roomId))
      }
    };
  }
)

const styles = StyleSheet.create({
  notifyToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  fetching: {
    animationName: animation.keyframes.pulse,
    animationDuration: '2s',
    animationIterationCount: 'infinite'
  }
})
