import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'
import ParticipantList from 'room/ParticipantList'
import RequestToJoin from 'room/RequestToJoin'
import JoinRequestList from 'room/JoinRequestList'
import CardTooltip from 'ui/CardTooltip'
import Icon from 'art/Icon'
import AddParticipantForm from 'room/AddParticipantForm'
import ClickOutside from 'ClickOutside'
import Button from 'ui/Button'
import { getJoinRequests, getRoomFull } from 'selectors/rooms'

class AddParticipantSection extends Component {
  state = {
    stage: 0,
    type: 'twitter'
  };

  render () {
    const { stage, type } = this.state
    const { dispatch, roomId } = this.props

    return (
      <div className={css(styles.section)}>
        <div className={css(styles.sectionTitle)}>
          Add a participant
        </div>
        {stage === 0 &&
          <div className={css(styles.iconWrapper)}>
            <Button
              iconOnly
              onClick={this.setSidewayType}
              label='Sideway Username'
              tooltip
            >
              <Icon
                name='sideway'
                fill={colors.brandgreen}
                style={{ width: 30, height: 30 }}
              />
            </Button>
            <Button
              iconOnly
              onClick={this.setTwitterType}
              label='Twitter Username'
              tooltip
            >
              <Icon
                name='twitter'
                fill={colors.twitterblue}
                style={{
                  width: 30,
                  height: 30,
                  marginLeft: 6,
                  marginBottom: 2
                }}
              />
            </Button>
            <Button
              iconOnly
              onClick={this.setEmailType}
              label='Email Address'
              tooltip
            >
              <Icon
                name='email'
                fill={colors.darkgray}
                style={{ width: 26, height: 26, marginLeft: 10 }}
              />
            </Button>
          </div>}
        <ClickOutside onClickOutside={this.reset}>
          {stage === 1 &&
            <AddParticipantForm
              onDone={this.reset}
              type={type}
              dispatch={dispatch}
              roomId={roomId}
            />}
        </ClickOutside>
      </div>
    )
  }

  handleSelectType = type => this.setState({ type, stage: 1 });

  setTwitterType = () => this.handleSelectType('twitter');

  setSidewayType = () => this.handleSelectType('sideway');

  setEmailType = () => this.handleSelectType('email');

  reset = () => this.setState({ stage: 0 });
}

class RequestListSection extends Component {
  render () {
    const { roomId, requestList } = this.props

    return (
      <div className='section join-request-section'>
        <div className='section-title'>
          Pending requests
        </div>
        <JoinRequestList roomId={roomId} requestList={requestList} />
      </div>
    )
  }
}

export class RoomParticipantsTooltip extends Component {
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
      roomId,
      ...rest
    } = this.props

    const requestList = getJoinRequests(requests)
    const roomIsFull = getRoomFull(participants, limits)
    const isParticipant = canWrite
    const roomActive = roomStatus === 'active'
    const roomNotCompleted = roomStatus !== 'completed'

    return (
      <CardTooltip.Popover {...rest} style={{ ...rest.style, width: 256 }}>
        <ParticipantList showNames fullList roomId={roomId} />
        {roomActive &&
          !roomIsFull &&
          !isParticipant &&
          <RequestToJoin
            dispatch={dispatch}
            loggedIn={loggedIn}
            profile={profile}
            requests={requests}
            roomId={roomId}
          />}
        {!!requestList.length &&
          isOwner &&
          <RequestListSection roomId={roomId} requestList={requestList} />}
        {roomNotCompleted &&
          isParticipant &&
          <AddParticipantSection dispatch={dispatch} roomId={roomId} />}
      </CardTooltip.Popover>
    )
  }
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8
  },
  sectionTitle: {
    ...font.body1
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'baseline'
  }
})

export default RoomParticipantsTooltip
