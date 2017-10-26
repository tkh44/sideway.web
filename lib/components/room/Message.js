import { Component } from 'react'
import ReactDOM from 'react-dom'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors } from 'style'
import withRouter from 'react-router-dom/es/withRouter'
import EditMessage from 'room/EditMessage'
import DeleteMessage from 'room/DeleteMessage'
import Popover from 'ui/Popover'
import MessageText from 'room/MessageText'
import MessagePopover from 'room/MessagePopover'
import { roomUIActions } from 'redux/room-ui'

const HEADER_HEIGHT = 128

class Message extends Component {
  componentDidMount () {
    if (this.props.message.deleted) {
      return
    }

    if (this.el && !this.props.roomActive && this.props.isHighlighted) {
      console.log('fired')
      this.scrollToMessage()
    }

    if (window.location.hash.split('#')[1] === this.props.message.id) {
      if (!this.props.roomActive) this.scrollToMessage()
    }
  }

  componentWillUnmount () {
    clearTimeout(this.scrollToTimeout)
  }

  render () {
    const {
      dispatch,
      isDeleting,
      isEditing,
      message,
      roomId
    } = this.props

    if (message.deleted) {
      return null
    }

    if (isEditing) {
      return (
        <EditMessage
          key={'edit-message-' + message.id}
          dispatch={dispatch}
          message={message}
          onEditCancel={this.handleToggleEdit}
          roomId={roomId}
        />
      )
    }

    if (isDeleting) {
      return (
        <DeleteMessage
          key={'delete-message-' + message.id}
          dispatch={dispatch}
          message={message}
          roomId={roomId}
        >
          {this.renderMessageInner()}
        </DeleteMessage>
      )
    }

    return this.renderMessageInner()
  }

  renderMessageInner () {
    const {
      canWrite,
      dispatch,
      displayName,
      groupIndex,
      isDeleting,
      isEditing,
      isHighlighted,
      isOwner,
      message,
      profileId,
      roomId,
      roomTitle,
      router,
      style,
      twitterHandle,
      username
    } = this.props

    return (
      <Popover
        ref={el => {
          this.el = el
        }}
        key={'message-' + message.id}
        id={message.id}
        className={css(
          styles.message,
          (message.comment || isDeleting) && styles.noPadding,
          message.text.indexOf('- ') === 0 && styles.noVerticalSpacing,
          !message.comment &&
            groupIndex !== 0 &&
            message.text.charAt(0) === '#' &&
            styles.increasedTopMargin,
          isHighlighted && styles.highlighted
        )}
        style={style}
        alignAtFirstChild
        alignPopover='right'
        arrowSize={6}
        component='div'
        openOnClick
        closeOnInnerClick
        onOpen={this.handlePopoverOpen}
        onClose={this.handlePopoverClose}
        popoverComponent={MessagePopover}
        popoverProps={{
          canWrite,
          dispatch,
          displayName,
          isMessageAuthor: message.user === profileId,
          isOwner,
          message,
          onEditClick: this.handleToggleEdit,
          roomId,
          roomTitle,
          router,
          twitterHandle,
          username
        }}
      >
        <MessageText
          isEditing={isEditing}
          isHighlighted={isHighlighted}
          message={message}
        />
      </Popover>
    )
  }

  handlePopoverOpen = () => {
    const { dispatch, message, roomId } = this.props
    dispatch(roomUIActions.highlightMessage({ roomId, messageId: message.id }))
  };

  handlePopoverClose = () => {
    const { dispatch, message, roomId } = this.props
    dispatch(roomUIActions.removeHighlight({ roomId, messageId: message.id }))
  };

  handleToggleEdit = () => {
    const { dispatch, isEditing, message, roomId } = this.props
    dispatch(
      roomUIActions.editMessage({
        roomId,
        messageId: isEditing ? undefined : message.id
      })
    )
  };

  scrollToMessage () {
    this.scrollToTimeout = setTimeout(
      () => {
        const el = ReactDOM.findDOMNode(this.el)
        el.scrollIntoView(false)
        const distance = el.getBoundingClientRect().top - HEADER_HEIGHT
        window.scrollBy(0, distance)
      },
      400
    )
  }
}

const styles = StyleSheet.create({
  message: {
    position: 'relative',
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 8,
    paddingLeft: 0,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 4,
    marginLeft: 0,
    borderRadius: 2,
    color: colors.darkgray,
    cursor: 'pointer'
  },
  highlighted: {},
  noPadding: {
    padding: 0
  },
  increasedTopMargin: {
    marginTop: 32 - 4
  },
  noVerticalSpacing: {
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 8,
    paddingLeft: 0
  },
  generatedChildren: {
    cursor: 'text'
  }
})

export default withRouter(Message)
