import { Component } from 'react'
import { connect } from 'react-redux'
import PendingComment from 'room/PendingComment'
import {
  getPendingComments,
  getRoomAccessRights,
  getRoomById
} from 'selectors/rooms'
import { isLoggedIn } from 'selectors/auth'
import * as domUtils from 'utils/dom'

const mapStateToProps = (initialState, initialProps) => {
  const roomId = initialProps.roomId

  return state => {
    const room = getRoomById(state, roomId)
    const profile = state.profile
    const loggedIn = isLoggedIn(state)
    const accessRights = getRoomAccessRights(room, profile.id)

    return {
      canWrite: accessRights.canWrite,
      loggedIn,
      pending: room.pending,
      profileId: profile.id,
      roomActive: room.status === 'active',
      roomPending: room.status === 'pending',
      roomCompleted: room.status === 'completed'
    }
  }
}

export default connect(mapStateToProps)(
  class PendingRoomPendingCommentList extends Component {
    scrollToBottom = false;

    componentWillUpdate (nextProps, nextState) {
      if (nextProps.roomActive && nextProps.pending !== this.props.activity) {
        this.scrollToBottom = domUtils.isScrolledToBottom(10)
      }
    }

    componentDidUpdate (prevProps, prevState) {
      if (this.scrollToBottom) {
        domUtils.scrollToBottom()
        this.scrollToBottom = false
      }
    }

    render () {
      const {
        canWrite,
        pending,
        profileId,
        roomActive,
        roomCompleted,
        roomId,
        roomPending
      } = this.props

      if (roomCompleted || (canWrite && roomActive)) {
        return null
      }

      const pendingComments = getPendingComments(pending, canWrite, profileId)

      return (
        <div>
          {pendingComments.map(comment => {
            return (
              <PendingComment
                key={comment.id}
                comment={comment}
                canWrite={canWrite}
                profileId={profileId}
                roomActive={roomActive}
                roomId={roomId}
                roomPending={roomPending}
                // for userLoader
                userAccount={comment.user}
              />
            )
          })}
        </div>
      )
    }
  }
)
