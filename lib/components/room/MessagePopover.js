import { Component } from 'react'
import { trimEnd } from 'lodash'
import removeMarkdown from 'remove-markdown'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors } from 'style'
import { queryString } from 'utils/string'
import TooltipIcon from 'art/TooltipIcon'
import CardTooltip from 'ui/CardTooltip'
import { roomActions } from 'redux/rooms'
import { roomUIActions } from 'redux/room-ui'

const ICON_WIDTH = 38

class MessagePopover extends Component {
  render () {
    const {
      canWrite,
      isMessageAuthor,
      isOwner,
      onEditClick,
      message,
      ...passable
    } = this.props

    const { approver, comment } = message

    return (
      <CardTooltip.Popover
        {...passable}
        flexDirection='row'
        style={{
          ...passable.style,
          height: ICON_WIDTH,
          paddingTop: 0,
          paddingRight: 4,
          paddingBottom: 0,
          paddingLeft: 4,
          backgroundColor: colors.white,
          border: `1px solid ${colors.fadedgreen}`,
          borderRadius: 2,
          color: colors.white
        }}
      >
        {canWrite &&
          <TooltipIcon
            key='delete'
            className={css(styles.menuIcon, styles.dangerIcon)}
            style={{
              width: ICON_WIDTH,
              height: ICON_WIDTH
            }}
            name='trash'
            fill={colors.red}
            tooltip={`Delete ${comment ? 'comment' : 'message'}`}
            arrowSize={6}
            onClick={this.handleDeleteClick}
          />}
        {
          // (canWrite) && React.createElement('div', { className: css(styles.seperator) }),
          // React.createElement(
          //   TooltipIcon,
          //   {
          //     key: 'create-new',
          //     className: css(styles.menuIcon),
          //     style: {
          //       width: ICON_WIDTH,
          //       height: ICON_WIDTH
          //     },
          //     name: 'create-new',
          //     fill: colors.midgray,
          //     tooltip: 'Create conversation from message',
          //     arrowSize: 6,
          //     onClick: this.handleCreateConvoClick
          //   }
          // ),
          <TooltipIcon
            key='twitter'
            className={css(styles.menuIcon)}
            style={{
              width: ICON_WIDTH,
              height: ICON_WIDTH
            }}
            name='twitter'
            fill={colors.midgray}
            tooltip='Tweet message'
            arrowSize={6}
            onClick={this.handleTweetClick}
          />
        }
        {((isMessageAuthor && !comment) || isOwner) &&
          <TooltipIcon
            key='edit'
            className={css(styles.menuIcon)}
            style={{
              width: ICON_WIDTH,
              height: ICON_WIDTH
            }}
            name='pencil'
            fill={colors.midgray}
            tooltip='Edit message'
            arrowSize={6}
            onClick={onEditClick}
          />}
        {canWrite &&
          comment &&
          <TooltipIcon
            key='reaction'
            className={css(styles.menuIcon)}
            style={{
              width: ICON_WIDTH,
              height: ICON_WIDTH
            }}
            name='switch'
            fill={colors.midgray}
            tooltip='Toggle reaction'
            arrowSize={6}
            onClick={this.handleToggleReaction}
          />}
        {canWrite &&
          !comment &&
          <TooltipIcon
            key='to-comment'
            className={css(styles.menuIcon)}
            style={{
              width: ICON_WIDTH,
              height: ICON_WIDTH
            }}
            name='quotes'
            fill={colors.midgray}
            tooltip='Turn into comment'
            arrowSize={6}
            onClick={this.handleMessageToComment}
          />}
        {canWrite &&
          comment &&
          !approver &&
          <TooltipIcon
            key='undo-comment'
            className={css(styles.menuIcon)}
            style={{
              width: ICON_WIDTH,
              height: ICON_WIDTH
            }}
            name='speech-bubbles'
            fill={colors.midgray}
            tooltip='Undo comment'
            arrowSize={6}
            onClick={this.handleCommentToMessage}
          />}
      </CardTooltip.Popover>
    )
  }

  // handleCreateConvoClick = async () => {
  //   const {
  //     dispatch,
  //     displayName,
  //     message,
  //     roomId,
  //     roomTitle,
  //     history: { push },
  //     username
  //   } = this.props
  //
  //   const about = `Discussing ${displayName}'s message`
  //   const messageLink = `${window.sideway.server.short}/${roomId}#${message.id}`
  //   const description = message.text + `\n\n— [${displayName}](/user/${username}) in [${roomTitle}](${messageLink})`
  //   const res = await dispatch(roomActions.createRoom({ about, description, status: 'pending' }))
  //   if (res.ok) {
  //     push(`/room/${res.data.id}`)
  //   }
  // }

  handleToggleReaction = () => {
    const { dispatch, message, roomId } = this.props
    dispatch(
      roomActions.patchMessage(roomId, message.id, {
        reaction: !message.reaction
      })
    )
  };

  handleMessageToComment = () => {
    const { dispatch, message, roomId } = this.props
    dispatch(roomActions.patchMessage(roomId, message.id, { comment: true }))
  };

  handleCommentToMessage = () => {
    const { dispatch, message, roomId } = this.props
    dispatch(roomActions.patchMessage(roomId, message.id, { comment: false }))
  };

  handleTweetClick = () => {
    const { roomId, message, twitterHandle } = this.props
    const { id, text } = message
    const cleanedText = removeMarkdown(text)

    const windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes'
    const width = 550
    const height = 420
    const winHeight = window.screen.height
    const winWidth = window.screen.width
    const left = Math.round(winWidth / 2 - width / 2)
    let top = 0

    if (winHeight > height) {
      top = Math.round(winHeight / 2 - height / 2)
    }

    const url = `${window.sideway.server.short}/${roomId}#${id}`
    let via = ''

    if (twitterHandle) {
      via = twitterHandle
    }

    const maxTextLength = 140 - url.length - twitterHandle.length
    let tweetText

    if (text.length >= maxTextLength) {
      tweetText = trimEnd(
        cleanedText.substring(0, maxTextLength).trim().replace(/\s(\w+)$/, ''),
        ' \n\r?,!.'
      ) + '… —'
    } else {
      tweetText = trimEnd(cleanedText, ' \n') + ' —'
    }

    const queryParams = { text: tweetText, url, via }

    window.open(
      `https://twitter.com/intent/tweet?${queryString(queryParams)}`,
      'intent',
      `${windowOptions},width=${width},height=${height},left=${left},top=${top}`
    )
  };

  handleDeleteClick = () => {
    const { dispatch, message, roomId } = this.props
    dispatch(
      roomUIActions.setDeleteMessageId({ roomId, messageId: message.id })
    )
  };
}

const styles = StyleSheet.create({
  menuIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    cursor: 'pointer',
    '.svg-icon': {
      height: ICON_WIDTH,
      width: ICON_WIDTH
    },
    ':hover svg': {
      fill: colors.brandgreen
    }
  },
  dangerIcon: {
    ':hover svg': {
      fill: colors.red
    }
  },
  seperator: {
    height: ICON_WIDTH - 8,
    width: 1,
    backgroundColor: colors.lightgray,
    paddingTop: 4,
    paddingBottom: 4,
    backgroundOrigin: 'content-box'
  }
})

export default MessagePopover
