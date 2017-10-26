import { Component } from 'react'
import { get } from 'lodash'
import compose from 'recompose/compose'
import defaultProps from 'recompose/defaultProps'
import withPropsOnChange from 'recompose/withPropsOnChange'
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys'
import MessageGroup from 'room/MessageGroup'
import { roomUIActions } from 'redux/room-ui'

export default compose(
  defaultProps({ collapsed: [] }),
  withPropsOnChange(['groupedMessages', 'collapsed'], ({
    groupedMessages,
    collapsed
  }) => ({
    expandedGroups: groupedMessages.filter(
      group => !collapsed[group.commentContext]
    )
  })),
  onlyUpdateForKeys([
    'blogMode',
    'canWrite',
    'collapsed',
    'deleteMessageId',
    'dispatch',
    'editingMessageId',
    'expandedGroups',
    'highlightedMessageId',
    'roomActive',
    'isOwner',
    'profileId',
    'roomId',
    'roomTitle'
  ])
)(
  class MessageList extends Component {
    render () {
      return (
        <div>
          {this.getStyles().map(config => {
            return (
              <MessageGroup key={config.key} offsets={400} {...config.data} />
            )
          })}
        </div>
      )
    }

    handleToggleCollapse = commentId => {
      const { dispatch, collapsed, roomId } = this.props

      if (collapsed[commentId]) {
        dispatch(roomUIActions.expandGroup({ roomId, commentId }))
      } else {
        dispatch(roomUIActions.collapseGroup({ roomId, commentId }))
      }
    };

    getStyles = () => {
      const {
        blogMode,
        canWrite,
        collapsed,
        deleteMessageId,
        dispatch,
        editingMessageId,
        expandedGroups,
        highlightedMessageId,
        roomActive,
        isOwner,
        profileId,
        roomId,
        roomTitle
      } = this.props

      return expandedGroups.map(group => {
        const key = `message--${group.system ? 'system' : group.user.id}--${group.firstTimestamp}`
        const replies = get(group, 'replies', [])
        const hasCollapsedChildren = replies.length &&
          collapsed[group.messages[0].id]

        return {
          key,
          data: {
            blogMode,
            canWrite,
            deleteMessageId,
            dispatch,
            editingMessageId,
            hasCollapsedChildren,
            highlightedMessageId,
            isOwner,
            messageGroup: group,
            profileId,
            roomActive,
            roomId,
            roomTitle,
            toggleCommentCollapse: this.handleToggleCollapse
          }
        }
      })
    };
  }
)
