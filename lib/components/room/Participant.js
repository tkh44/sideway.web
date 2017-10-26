import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import Avatar from 'ui/Avatar'
import { roomActions } from 'redux/rooms'
import DisplayName from 'ui/DisplayName'
import ParticipantSquare from 'room/ParticipantSquare'
import Confirm from 'ui/Confirm'
import Button from 'ui/Button'
import Icon from 'art/Icon'

class ParticipantManagement extends Component {
  render () {
    const {
      user,
      isOwner,
      isSelf,
      onAddClick,
      onConfirmRemoval
    } = this.props

    return (
      <div className={css(styles.management)}>
        {isOwner &&
          user.disabled &&
          <Button
            className={css(styles.managementIcon)}
            iconOnly
            onClick={onAddClick}
            label='Add'
            tooltip
          >
            <Icon
              name='square-plus-max-medical'
              className={css(styles.icon)}
              style={{
                height: 24,
                width: 24
              }}
            />
          </Button>}
        {!user.disabled &&
          !isSelf &&
          <Button
            onClick={onConfirmRemoval}
            label={`Remove ${user.display}`}
            tooltip
            iconOnly
          >
            <Icon
              name='square-minus-min'
              style={{
                height: 24,
                width: 24
              }}
            />
          </Button>}
        {!user.disabled &&
          isSelf &&
          <Button
            onClick={e => {
              console.log(e)
              onConfirmRemoval(e)
            }}
            label='Leave Conversation'
            tooltip
            iconOnly
          >
            <Icon
              name='square-cross'
              style={{
                height: 24,
                width: 24
              }}
            />
          </Button>}
      </div>
    )
  }
}

class Participant extends Component {
  constructor (props) {
    super(props)

    this.state = {
      confirming: false
    }
  }

  componentDidMount () {
    this.mounted = true
  }

  componentWillUnmount () {
    this.mounted = false
  }

  render () {
    const { showName = false } = this.props

    return showName
      ? this.renderFullParticipant()
      : this.renderSquareParticipant()
  }

  renderSquareParticipant () {
    const {
      dispatch,
      roomCompleted,
      style,
      user
    } = this.props

    return (
      <ParticipantSquare
        style={style}
        dispatch={dispatch}
        roomCompleted={roomCompleted}
        user={user}
      />
    )
  }

  renderFullParticipant () {
    const {
      canWrite,
      dispatch,
      isOwner,
      isSelf,
      roomCompleted,
      roomId,
      style,
      user
    } = this.props

    if (this.state.confirming) {
      return this.renderConfirmation()
    }

    const showManage = canWrite && !roomCompleted
      ? (isOwner && !isSelf) || (!isOwner && isSelf)
      : !isOwner && isSelf

    return (
      <div className={css(styles.participantRectangle)} style={style}>
        <Avatar
          size='medium'
          user={user}
          fade={user.disabled}
          present={user.present}
        />
        <DisplayName className={css(styles.listItemDisplayName)} user={user} />
        {showManage &&
          <ParticipantManagement
            isOwner={isOwner}
            isSelf={isSelf}
            roomId={roomId}
            user={user}
            dispatch={dispatch}
            onConfirmRemoval={this.handleRemovalConfirm}
            onAddClick={this.handleAddClick}
          />}
      </div>
    )
  }

  renderConfirmation () {
    const {
      user,
      isSelf
    } = this.props

    const confirmationMessage = isSelf
      ? 'Leaving will prevent you from participating in this conversation'
      : `Remove ${user.display}?`

    return (
      <Confirm
        className={css(styles.listItem)}
        message={confirmationMessage}
        onCancel={this.handleCancel}
        onConfirm={this.handleRemovalClick}
        cancelText='No'
        confirmText={isSelf ? 'Leave' : 'Remove'}
      >
        <Avatar
          size='medium'
          user={user}
          fade={user.disabled}
          present={user.present}
        />
      </Confirm>
    )
  }

  handleRemovalConfirm = () => {
    console.log('hey there')
    if (this.state.confirming) {
      return
    }

    this.setState({ confirming: true })
  };

  handleCancel = () => {
    this.setState({ confirming: false })
  };

  handleAddClick = () => {
    const { dispatch, roomId, user } = this.props
    dispatch(roomActions.addParticipantById(roomId, user.id))
  };

  handleRemovalClick = () => {
    const { dispatch, roomId, user } = this.props
    this.setState({ confirming: false })
    dispatch(roomActions.removeParticipant(roomId, user.id))
  };
}

const styles = StyleSheet.create({
  participantRectangle: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12
  },
  listItemDisplayName: {
    flex: 'none',
    paddingLeft: 8
  },
  management: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
    marginTop: 5
  },
  managementIcon: {
    height: 24,
    width: 24
  }
})

export default Participant
