import { connect } from 'react-redux'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors } from 'style'
import Icon from 'art/Icon'
import Button from 'ui/Button'
import {
  getPendingComments,
  getRoomAccessRights,
  getRoomById
} from 'selectors/rooms'

const mapStateToProps = (initialState, initialProps) => {
  const roomId = initialProps.roomId

  return state => {
    const profile = state.profile
    const room = getRoomById(state, roomId)
    const accessRights = getRoomAccessRights(room, profile.id)

    return {
      pendingCommentCount: getPendingComments(
        room.pending,
        accessRights.canWrite,
        profile.id
      ).length
    }
  }
}

export default connect(mapStateToProps)(({
  pendingCommentCount,
  onClick,
  style
}) => {
  return (
    <Button
      iconOnly
      label='Toggle Pending Comments'
      tooltip='Toggle Pending Comments'
      onClick={onClick}
      style={style}
    >
      <Icon
        name='speech-bubbles'
        style={{
          width: 32,
          height: 32
        }}
      />
      {pendingCommentCount > 0 &&
        <div className={css(styles.countNotification)}>
          {pendingCommentCount}
        </div>}
    </Button>
  )
})

const styles = StyleSheet.create({
  countNotification: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -1,
    right: -6,
    height: 18,
    width: 18,
    borderRadius: '50%',
    textAlign: 'center',
    background: colors.red,
    color: colors.white,
    fontSize: 10,
    lineHeight: '1'
  }
})
