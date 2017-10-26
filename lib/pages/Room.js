import { Component } from 'react'
import { connect } from 'react-redux'
import { get } from 'lodash'
import loadRoom from 'room/room-loader'
import updateDocTitle from 'hoc/update-doc-title'
import roomDoor from 'room/room-door'
import roomLoadingWrapper from 'room/room-loading-wrapper'
import compose from 'recompose/compose'
import withProps from 'recompose/withProps'
import withPropsOnChange from 'recompose/withPropsOnChange'
import { css, StyleSheet } from 'aphrodite/no-important'
import { breakpoints, font, mediaQueries } from 'style'
import WindowState from 'window-state'
import RoomHeader from 'room/RoomHeader'
import RoomFooter from 'room/RoomFooter'
import CountDown from 'room/CountDown'
import RoomMeta from 'room/RoomMeta'
import RoomTopic from 'room/RoomTopic'
import RoomScrollManager from 'room/RoomScrollManager'
import MessageList from 'room/MessageList'
import ActivityUpdateList from 'room/ActivityUpdateList'
import TranscriptPendingCommentList from 'room/TranscriptPendingCommentList'
import Embed from 'ui/Embed'
import NesStatus from 'ui/NesStatus'
import { api } from 'api'
import { roomUIActions } from 'redux/room-ui'
import {
  getRoomAccessRights,
  getRoomBlogMode,
  getRoomById,
  groupMessages
} from 'selectors/rooms'
import * as domUtils from 'utils/dom'

const HEADER_HEIGHT = 64
const SUBHEADER_HEIGHT = 64

const makeMapStateToProps = (initialState, initialProps) => {
  const roomId = initialProps.roomId

  return state => {
    const room = getRoomById(state, roomId)
    const profile = state.profile
    const accessRights = getRoomAccessRights(room, profile.id)
    const lastActivity = get(room, 'system.last')
    const hasContext = room.context && room.context.url
    const contextUrl = hasContext && room.context.url
    const ui = state.roomUI[room.id] || {}

    return {
      ...accessRights,
      blogMode: getRoomBlogMode(room.messages),
      contextUrl,
      description: room.description,
      hasContext,
      isActiveParticipant: !!room.participants[profile.id],
      isFetching: get(room, '$$meta.fetching'),
      isPublic: room.public,
      links: room.links,
      roomMarkdown: room.markdown,
      messages: room.messages,
      participants: room.participants,
      profile,
      push: state.push,
      renderCountDown: room &&
        room.status === 'active' &&
        accessRights.canWrite &&
        lastActivity,
      roomActive: room.status === 'active',
      roomPending: room.status === 'pending',
      roomStarted: room.started,
      roomStatus: room.status,
      roomSystem: room.system,
      roomTime: room.time,
      roomTopic: get(room, 'system.topic.message', ''),
      roomUI: ui,
      title: room.title
    }
  }
}

export default compose(
  withProps(props => {
    return {
      highlightedMessageId: get(props, 'location.hash', '').split('#')[1],
      isEmbedded: get(props, 'location.search', '').includes('embed=true')
    }
  }),
  loadRoom({ redirectOnError: true }),
  roomDoor,
  roomLoadingWrapper,
  connect(makeMapStateToProps),
  updateDocTitle(props => props.title),
  withPropsOnChange(['messages', 'participants', 'roomActive'], ({
    messages,
    participants,
    roomActive
  }) => ({
    groupedMessages: groupMessages(messages, participants, roomActive)
  }))
)(
  class Room extends Component {
    resizeAnimationId = null;

    componentDidMount () {
      const {
        dispatch,
        highlightedMessageId,
        roomId
      } = this.props

      dispatch(
        roomUIActions.highlightMessage({
          roomId,
          messageId: highlightedMessageId
        })
      )
    }

    componentWillReceiveProps (nextProps) {
      const { dispatch, roomId } = nextProps

      if (this.props.highlightedMessageId !== nextProps.highlightedMessageId) {
        dispatch(
          roomUIActions.highlightMessage({
            roomId,
            messageId: nextProps.highlightedMessageId
          })
        )
      }
    }

    componentWillUpdate (nextProps, nextState) {
      if (!nextProps.roomActive) {
        return
      }
      this.scrollToBottom = domUtils.isScrolledToBottom(10)
    }

    componentDidUpdate (prevProps, prevState) {
      if (this.scrollToBottom) {
        domUtils.scrollToBottom()
        this.scrollToBottom = false
      }
    }

    componentWillUnmount () {
      window.cancelAnimationFrame(this.resizeAnimationId)
    }

    render () {
      const {
        blogMode,
        canWrite,
        contextUrl,
        dispatch,
        description,
        groupedMessages,
        hasContext,
        isAdmin,
        isEmbedded,
        isFetching,
        isOwner,
        isPublic,
        links,
        loggedIn,
        profile,
        push,
        renderCountDown,
        roomId,
        roomActive,
        roomMarkdown,
        roomPending,
        roomStarted,
        roomStatus,
        roomSystem,
        roomTime,
        roomTopic,
        roomUI,
        style,
        title
      } = this.props

      return (
        <WindowState>
          {(
            {
              scrollTop,
              winWidth,
              winHeight
            }
          ) => {
            const headerY = this.calcHeaderY(scrollTop, isEmbedded)

            return (
              <div className={css(styles.roomPage)} style={style}>
                {roomActive && <RoomScrollManager {...this.props} />}
                {renderCountDown &&
                  <CountDown onComplete={this.handleCountDownComplete} />}
                <RoomHeader
                  canWrite={canWrite}
                  dispatch={dispatch}
                  headerY={headerY}
                  isAdmin={isAdmin}
                  isOwner={isOwner}
                  isPublic={isPublic}
                  profileId={profile.id}
                  roomActive={roomActive}
                  roomId={roomId}
                  roomMarkdown={roomMarkdown}
                  roomPending={roomPending}
                  roomStatus={roomStatus}
                  roomStarted={roomStarted}
                  roomSystem={roomSystem}
                  roomTime={roomTime}
                  roomUI={roomUI}
                  scrollTop={scrollTop}
                  title={title}
                  winHeight={winHeight}
                  winWidth={winWidth}
                />
                {roomActive &&
                  <NesStatus
                    className={css(styles.nesStatus)}
                    style={{
                      top: HEADER_HEIGHT + SUBHEADER_HEIGHT + headerY
                    }}
                    connectedText={
                      roomActive ? 'Conversation is live!' : 'Connected!'
                    }
                    messageClassName={css(styles.nesStatusMessage)}
                  />}
                <div
                  className={css(
                    styles.roomContent,
                    isEmbedded && styles.roomContentEmbedded
                  )}
                >
                  <RoomMeta
                    dispatch={dispatch}
                    description={description}
                    isAdmin={isAdmin}
                    isOwner={isOwner}
                    links={links}
                    loggedIn={loggedIn}
                    push={push}
                    roomId={roomId}
                    roomPending={roomPending}
                    roomStarted={roomStarted}
                    roomTime={roomTime}
                    roomUI={roomUI}
                    title={title}
                  />
                  {hasContext &&
                    <Embed
                      key='embeded-content'
                      contextUrl={contextUrl}
                      inline
                    />}
                  <MessageList
                    canWrite={canWrite}
                    blogMode={blogMode}
                    collapsed={roomUI.collapsed}
                    deleteMessageId={roomUI.deleteMessageId}
                    dispatch={dispatch}
                    editingMessageId={roomUI.editingMessageId}
                    groupedMessages={groupedMessages}
                    highlightedMessageId={roomUI.highlightedMessageId}
                    isFetching={isFetching}
                    isOwner={isOwner}
                    profileId={profile.id}
                    roomActive={roomActive}
                    roomId={roomId}
                    roomTitle={title}
                  />
                  <ActivityUpdateList roomId={roomId} />
                  <TranscriptPendingCommentList roomId={roomId} />
                  <RoomTopic
                    roomActive={roomActive}
                    dispatch={dispatch}
                    isAdmin={isAdmin}
                    isOwner={isOwner}
                    roomId={roomId}
                    showTopicInput={roomUI.showTopicInput}
                    topic={roomTopic}
                  />
                </div>
                <RoomFooter
                  dispatch={dispatch}
                  headerHeight={HEADER_HEIGHT + SUBHEADER_HEIGHT + headerY + 4}
                  isAdmin={isAdmin}
                  isOwner={isOwner}
                  loggedIn={loggedIn}
                  onInputBlur={this.handleInputBlur}
                  onInputFocus={this.handleInputFocus}
                  onInputUpKey={this.handleInputUpKey}
                  onTextareaResize={domUtils.scrollToBottom}
                  roomActive={roomActive}
                  roomId={roomId}
                  roomUI={roomUI}
                  topic={roomTopic}
                />
              </div>
            )
          }}
        </WindowState>
      )
    }

    handleInputUpKey = e => {
      const { dispatch, groupedMessages, profile, roomId } = this.props
      const { selectionStart, selectionEnd } = e.target

      if (selectionStart === 0 && selectionEnd === 0) {
        e.preventDefault()
        e.stopPropagation()
        const lastGroup = groupedMessages[groupedMessages.length - 1]
        if (lastGroup.user.id === profile.id) {
          const lastMessage = lastGroup.messages[lastGroup.messages.length - 1]
          dispatch(
            roomUIActions.editMessage({ roomId, messageId: lastMessage.id })
          )
        }
      }
    };

    handleInputFocus = () => {
      const { dispatch, roomId } = this.props
      dispatch(roomUIActions.setInputFocus({ roomId, inputFocused: true }))
    };

    handleInputBlur = () => {
      const { dispatch, roomId } = this.props
      dispatch(roomUIActions.setInputFocus({ roomId, inputFocused: false }))
    };

    handleCountDownComplete = () => {
      const { roomId } = this.props
      // We don't want this outdated call to go through redux.
      // We just want to ping the api so that it can send a sub update to all the clients
      api(`/room/${roomId}`)
    };

    // This is here so that we can know where the header is at in all the child components
    calcHeaderY = (scrollTop, isEmbedded) => {
      return scrollTop > HEADER_HEIGHT + SUBHEADER_HEIGHT || isEmbedded
        ? -1 * HEADER_HEIGHT
        : 0
    };
  }
)

const styles = StyleSheet.create({
  roomPage: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1'
  },
  roomContent: {
    flex: '1',
    width: 'calc(100% - 1rem)',
    maxWidth: breakpoints.tablet,
    marginTop: 160,
    marginRight: 'auto',
    marginLeft: 'auto',
    [mediaQueries.phone]: {
      width: 'calc(100% - 2rem)'
    }
  },
  roomContentEmbedded: {
    marginTop: 96
  },
  nesStatus: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    left: 16,
    right: 16,
    width: 'calc(100% - 32px)',
    maxWidth: breakpoints.tablet,
    paddingTop: 4,
    paddingRight: 2,
    paddingBottom: 4,
    paddingLeft: 2,
    color: 'white',
    borderRadius: 2,
    textAlign: 'center',
    zIndex: 8,
    [mediaQueries.phone]: {
      margin: '0 auto',
      width: 'calc(100% - 64px)',
      left: 32,
      right: 32
    }
  },
  nesStatusMessage: {
    ...font.caption,
    [mediaQueries.tablet]: {
      ...font.body1
    }
  }
})
