import { Component } from 'react'
import { connect } from 'react-redux'
import { css, StyleSheet } from 'aphrodite/no-important'
import Participant from 'room/Participant'
import Icon from 'art/Icon'
import RoomParticipantsTooltip from 'room/RoomParticipantsTooltip'
import Popover from 'ui/Popover'
import {
  getJoinRequests,
  getRoomAccessRights,
  getRoomById,
  participantsToUsers
} from 'selectors/rooms'
import { isLoggedIn } from 'selectors/auth'
import { colors, font } from 'style'

class ParticipantMenuItem extends Component {
  render () {
    const {
      canWrite,
      dispatch,
      roomStatus,
      isOwner,
      limits,
      loggedIn,
      participants,
      profile,
      requests,
      roomId
    } = this.props
    const requestList = getJoinRequests(requests)
    const showNotificationCount = isOwner && !!requestList.length

    return (
      <Popover
        className={css(
          styles.menuButton,
          showNotificationCount && styles.hasNotifications
        )}
        component='div'
        topBuffer={8}
        role='button'
        ignoreAttr='data-ignore-popover-close'
        popoverProps={{
          tooltip: canWrite ? 'Participant Settings' : 'Participants'
        }}
      >
        <Popover
          animate={false}
          component='div'
          openOnClick
          arrowSize={12}
          ignoreAttr='data-ignore-popover-close'
          popoverComponent={RoomParticipantsTooltip}
          popoverProps={{
            canWrite,
            dispatch,
            roomStatus,
            isOwner,
            limits,
            loggedIn,
            participants,
            profile,
            requests,
            roomId
          }}
          resizeOnPopoverPropsChange={['participants']}
        >
          <Icon
            name='arrow-down'
            fill={colors.brandgreen}
            style={{
              height: 24,
              width: 24
            }}
          />
          {showNotificationCount &&
            <div className={css(styles.menuNotification)}>
              {requestList.length}
            </div>}
        </Popover>
      </Popover>
    )
  }
}

const ParticipantList = (
  {
    className,
    dispatch,
    fullList = false,
    limits,
    loggedIn,
    roomStatus,
    isOwner,
    isPublic,
    owner,
    participants,
    profile,
    requests,
    roomId,
    canWrite,
    showDetailsButton = false,
    showNames = false,
    style
  }
) => {
  const roomCompleted = roomStatus === 'completed'
  const participantList = participantsToUsers(participants, owner)
  const participantListLength = participantList.length
  const list = fullList
    ? participantList
    : participantList.filter(user => !user.disabled).slice(0, 5)

  return (
    <div
      className={css(styles.list, showNames && styles.showNames)}
      style={style}
    >
      {list.map((user, i) => {
        return (
          <Participant
            canWrite={canWrite}
            dispatch={dispatch}
            index={i}
            isOwner={isOwner}
            isSelf={user.id === profile.id}
            key={user.id}
            roomCompleted={roomCompleted}
            roomPublic={isPublic}
            roomId={roomId}
            showName={showNames}
            user={user}
          />
        )
      })}
      {showDetailsButton &&
        <ParticipantMenuItem
          canWrite={canWrite}
          limits={limits}
          loggedIn={loggedIn}
          participants={participants}
          profile={profile}
          requests={requests}
          roomId={roomId}
          dispatch={dispatch}
          isOwner={isOwner}
          roomStatus={roomStatus}
        />}
      {!fullList &&
        participantListLength - 5 > 0 &&
        <div className={styles.otherParticipants}>
          {`+${participantListLength - 5}`}
        </div>}
    </div>
  )
}

const styles = StyleSheet.create({
  list: {
    display: 'flex'
  },
  showNames: {
    display: 'block'
  },
  menuButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    height: 28,
    width: 28
  },
  hasNotifications: {
    border: `1px solid ${colors.fadedgreen}`,
    borderRadius: 2
  },
  menuNotification: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -8,
    right: -8,
    height: 16,
    width: 16,
    borderRadius: '50%',
    background: colors.red,
    color: colors.white,
    fontSize: 10,
    lineHeight: '1'
  },
  otherParticipants: {
    ...font.title,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    color: colors.fadedgreen
  }
})

const mapStateToProps = (initialState, initialProps) => {
  const roomId = initialProps.roomId

  return state => {
    const room = getRoomById(state, roomId)
    const { profile } = state
    const accessRights = getRoomAccessRights(room, profile.id)
    const loggedIn = isLoggedIn(state)

    return {
      canWrite: accessRights.canWrite,
      roomStatus: room.status,
      isOwner: profile.id && room.owner === profile.id,
      isPublic: room.public,
      requests: room.requests,
      limits: room.limits,
      loggedIn,
      owner: room.owner,
      participants: room.participants,
      profile
    }
  }
}

export default connect(mapStateToProps)(ParticipantList)
