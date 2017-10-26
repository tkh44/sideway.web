import compose from 'recompose/compose'
import withHandlers from 'recompose/withHandlers'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, commonStyles, font } from 'style'
import Avatar from 'ui/Avatar'
import Button from 'ui/Button'
import DisplayName from 'ui/DisplayName'
import { roomActions } from 'redux/rooms'
import loadUser from 'hoc/user-loader'

export default compose(
  loadUser('id'),
  withHandlers({
    handleRejection: ({ dispatch, roomId, user }) =>
      () => {
        dispatch(roomActions.rejectJoinRequest(roomId, user.id))
      },
    handleAccept: ({ dispatch, roomId, user }) =>
      () => {
        dispatch(roomActions.addParticipantById(roomId, user.id))
      }
  })
)(({ request, user, handleRejection, handleAccept }) => {
  return (
    <div className={css(styles.requestItem)}>
      <div className={css(styles.header)}>
        <Avatar size='medium' user={user} />
        <DisplayName className={css(styles.displayName)} user={user} />
      </div>
      {request.message &&
        <div className={css(styles.joinMessage)}>
          {request.message}
        </div>}
      <div className={css(styles.actionRow)}>
        <Button
          color='red'
          textOnly
          label='reject'
          style={{
            paddingLeft: 0
          }}
          onClick={handleRejection}
        >
          Reject
        </Button>
        <Button
          color='brandgreen'
          textOnly
          label='accept'
          style={{
            marginLeft: 8
          }}
          onClick={handleAccept}
        >
          Accept
        </Button>
      </div>
    </div>
  )
})

const styles = StyleSheet.create({
  requestItem: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 8,
    paddingRight: 8,
    paddingBottom: 8,
    paddingLeft: 8
  },
  header: {
    display: 'flex'
  },
  displayName: {
    ...font.body2,
    ...commonStyles.overflowEllipsis,
    display: 'flex',
    alignItems: 'center',
    height: 28,
    paddingLeft: 8
  },
  joinMessage: {
    ...font.caption,
    paddingTop: 8,
    paddingBottom: 4,
    color: colors.lightgray
  },
  actionRow: {
    display: 'flex',
    paddingTop: 8
  }
})
