import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, commonStyles, font } from 'style'
import loadUser from 'hoc/user-loader'
import TranscriptEntryMeta from 'room/TranscriptEntryMeta'
import Icon from 'art/Icon'
import Button from 'ui/Button'
import FormattedText from 'ui/FormattedText'
import { roomActions } from 'redux/rooms'

const ParticipantActions = ({ onReject, onApprove, roomPending }) => {
  return (
    <div className={css(styles.actions)}>
      <Button
        color='red'
        type='button'
        label='reject'
        textOnly
        onClick={onReject}
      >
        Reject
      </Button>
      {!roomPending &&
        <Button
          color='brandgreen'
          type='button'
          label='Approve'
          textOnly
          onClick={onApprove}
        >
          Approve
        </Button>}
    </div>
  )
}

const CreatorActions = ({ onDelete }) => {
  return (
    <div className={css(styles.actions)}>
      <Button
        color='red'
        textOnly
        label='Delete Pending Comment'
        tooltip
        onClick={onDelete}
      >
        Delete Pending Comment
      </Button>
    </div>
  )
}

const CommentContent = props => {
  const {
    comment,
    canWrite,
    user,
    onReject,
    onApprove,
    onDelete,
    onReactionToggle,
    roomPending
  } = props

  return (
    <div className={css(styles.inner)}>
      <TranscriptEntryMeta user={user} timestamp={comment.ts}>
        {!roomPending &&
          canWrite &&
          <div className={css(styles.menuReaction)}>
            <Icon
              className={css(styles.switchIcon)}
              name='switch'
              onClick={onReactionToggle}
              style={{
                height: 24,
                width: 24
              }}
            />
          </div>}
      </TranscriptEntryMeta>
      <FormattedText
        text={comment.text}
        hideEmbedOnlyBorder
        removeLinkOnlyText
      />
      {canWrite &&
        <ParticipantActions
          onReject={onReject}
          onApprove={onApprove}
          roomPending={roomPending}
        />}
      {!canWrite && <CreatorActions onDelete={onDelete} />}
    </div>
  )
}

class PendingComment extends Component {
  render () {
    const { comment, canWrite, roomPending, user, style } = this.props

    return (
      <div
        className={css(
          styles.pending,
          roomPending && styles.noPadding,
          comment.reaction && styles.reaction
        )}
        style={style}
      >
        <CommentContent
          onApprove={this.handleApprove}
          onReject={this.handleReject}
          onDelete={this.handleDelete}
          onReactionToggle={this.handleToggleReaction}
          comment={comment}
          canWrite={canWrite}
          roomPending={roomPending}
          user={user}
        />
      </div>
    )
  }

  handleReject = () => {
    const { comment, dispatch, roomId } = this.props
    dispatch(roomActions.rejectComment(roomId, comment.id))
  };

  handleApprove = async () => {
    const { comment, dispatch, onApprove, roomId } = this.props

    const res = await dispatch(roomActions.approveComment(roomId, comment.id))

    if (res.ok) {
      onApprove()
    }
  };

  handleDelete = () => {
    const { comment, dispatch, roomId } = this.props
    dispatch(roomActions.deletePendingComment(roomId, comment.id))
  };

  handleToggleReaction = () => {
    const { comment, dispatch, roomId } = this.props
    dispatch(
      roomActions.togglePendingCommentReaction(
        roomId,
        comment.id,
        !comment.reaction
      )
    )
  };
}

const styles = StyleSheet.create({
  pending: {
    ...font.body1,
    paddingTop: 8,
    paddingBottom: 16,
    wordBreak: 'break-word',
    wordWrap: 'break-word'
  },
  reaction: {
    paddingLeft: 48
  },
  pendingRoomComment: {
    marginBottom: 16
  },
  inner: {
    ...commonStyles.drawnBorder(true, true, true, true, colors.faintgray),
    position: 'relative',
    paddingTop: 12,
    paddingRight: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    backgroundColor: 'rgba(247, 247, 247, 0.54)'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 8
  },
  menuReaction: {
    cursor: 'pointer'
  },
  switchIcon: {
    ':hover': {
      fill: colors.brandgreen
    }
  }
})

export default loadUser('id', true)(PendingComment)
