import { Component } from 'react'
import { connect } from 'react-redux'
import { throttle } from 'lodash'
import Bubble from 'room/bubble'
import { getRoomById, getUserActivity } from 'selectors/rooms'
import { roomActions } from 'redux/rooms'

const THROTTLE_DURATION = 500

class ConnectedBubble extends Component {
  render () {
    return <Bubble syncHandler={this.handleSync} {...this.props} />
  }

  handleSync = throttle(
    (payload, cb) => {
      const { dispatch, profileId, roomId } = this.props

      dispatch(roomActions.updateActivity(profileId, roomId, payload, cb))
    },
    THROTTLE_DURATION
  );
}

const mapStateToProps = (initialState, initialProps) => {
  const roomId = initialProps.roomId

  return state => {
    const room = getRoomById(state, roomId)
    const profile = state.profile
    const { pos, hidden, input, interrupted } = getUserActivity(
      profile,
      room.activity
    )

    return {
      hidden,
      input,
      interrupted,
      isPublic: !!room.public,
      nesDisconnected: state.nes.disconnect,
      pos,
      profileId: profile.id
    }
  }
}

export default connect(mapStateToProps)(ConnectedBubble)
