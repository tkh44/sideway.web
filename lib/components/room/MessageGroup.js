import { Component } from 'react'
import { get } from 'lodash'
import { css, StyleSheet } from 'aphrodite/no-important'
import TranscriptEntryMeta from 'room/TranscriptEntryMeta'
import SystemMessage from 'room/SystemMessage'
import Message from 'room/Message'
import Icon from 'art/Icon'
import Button from 'ui/Button'
import { colors, font } from 'style'

export default class extends Component {
  render () {
    const {
      blogMode,
      canWrite,
      deleteMessageId,
      dispatch,
      editingMessageId,
      hasCollapsedChildren,
      highlightedMessageId,
      roomActive,
      isOwner,
      messageGroup,
      profileId,
      roomId,
      roomTitle,
      style,
      toggleCommentCollapse
    } = this.props

    if (messageGroup.system === true) {
      return <SystemMessage messageGroup={messageGroup} />
    }

    const showBottomToolbar = !roomActive &&
      messageGroup.comment &&
      !!get(messageGroup, 'replies', []).length

    return (
      <div
        className={css(
          styles.messageGroup,
          !showBottomToolbar && styles.expandedGroup,
          messageGroup.comment && styles.commentGroup,
          messageGroup.reaction && styles.indent
        )}
        style={style}
      >
        <TranscriptEntryMeta
          blogMode={blogMode}
          timestamp={roomActive || blogMode ? messageGroup.lastTimestamp : null}
          user={messageGroup.user}
        />
        {messageGroup.messages.map((message, index) => {
          return (
            <Message
              key={message.id}
              canWrite={canWrite}
              dispatch={dispatch}
              displayName={get(messageGroup.user, 'display')}
              isDeleting={message.id === deleteMessageId}
              isEditing={message.id === editingMessageId}
              isHighlighted={message.id === highlightedMessageId}
              isOwner={isOwner}
              message={message}
              profileId={profileId}
              roomActive={roomActive}
              roomId={roomId}
              roomTitle={roomTitle}
              twitterHandle={get(messageGroup.user, 'networks.twitter', '')}
              username={get(messageGroup.user, 'username', '')}
            />
          )
        })}
        {showBottomToolbar &&
          <div className={css(styles.bottomToolbar)}>
            <Button
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 0
              }}
              textOnly
              color='brandgreen'
              label={hasCollapsedChildren ? 'Expand' : 'Collapse'}
              onClick={() => toggleCommentCollapse(messageGroup.messages[0].id)}
            >
              <Icon
                className={css(styles.collapseIcon)}
                style={{ width: 32, height: 32 }}
                name={hasCollapsedChildren ? 'arrow-down' : 'arrow-up'}
              />
            </Button>
          </div>}
      </div>
    )
  }
}

const styles = StyleSheet.create({
  messageGroup: {
    ...font.body1,
    paddingTop: 8,
    wordBreak: 'break-word',
    wordWrap: 'break-word'
  },
  commentGroup: {
    position: 'relative',
    paddingTop: 8,
    paddingRight: 8,
    paddingLeft: 8,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#f1f3f5'
  },
  expandedGroup: {
    paddingBottom: 16
  },
  messageGroupContent: {
    position: 'relative'
  },
  indent: {
    marginLeft: 48
  },
  highlight: {
    backgroundColor: 'rgba(20, 186, 20, 0.08)'
  },
  bottomToolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  collapseIcon: {
    cursor: 'pointer',
    fill: colors.brandgreen
  },
  hiddenCount: {
    ...font.body1,
    paddingRight: 8,
    paddingBottom: 0
  }
})
