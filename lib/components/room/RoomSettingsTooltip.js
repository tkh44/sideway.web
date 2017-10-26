import { Component } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import withRouter from 'react-router/es/withRouter'
import { css, StyleSheet } from 'aphrodite/no-important'
import { font } from 'style'
import EndConversation from 'room/EndConversation'
import DeleteConversation from 'room/DeleteConversation'
import PrivacyToggle from 'room/PrivacyToggle'
import AddToPage from 'room/AddToPage'
import CardTooltip from 'ui/CardTooltip'
import { roomActions } from 'redux/rooms'
import { roomUIActions } from 'redux/room-ui'
import SidewayModal from 'modals/SidewayModal'
import Button from 'ui/Button'
import { colors } from '../../style'
import Icon from '../art/Icon'

class MarkdownPreviewModal extends Component {
  state = {
    copied: false
  };

  render () {
    const { roomMarkdown, roomTitle } = this.props

    if (!roomMarkdown) {
      return (
        <div
          className={css(styles.markdownPreviewContent)}
          data-ignore-popover-close
        >
          <div className={css(styles.mardownPreviewHeader)}>
            <h4 className={css(styles.mardownPreviewHeaderText)}>
              {roomTitle}
            </h4>
          </div>
          <div className={css(styles.markdownPreviewLoading)}>
            Generating Markdown
          </div>
        </div>
      )
    }

    const error = roomMarkdown &&
      roomMarkdown.$$meta &&
      roomMarkdown.$$meta.ok !== true

    return (
      <div
        className={css(styles.markdownPreviewContent)}
        data-ignore-popover-close
      >
        <div className={css(styles.mardownPreviewHeader)}>
          <h4 className={css(styles.mardownPreviewHeaderText)}>{roomTitle}</h4>
          {!error &&
            <CopyToClipboard
              text={roomMarkdown.content}
              onCopy={() => this.setState({ copied: true })}
            >
              <Button
                label={'copy markdown to clipboard'}
                color={this.state.copied ? 'brandgreen' : null}
                style={{
                  ...font.body2,
                  marginTop: 2,
                  marginLeft: 16,
                  paddingBottom: 0,
                  paddingTop: 0
                }}
              >
                {this.state.copied ? 'Markdown Copied' : 'Copy Markdown'}
              </Button>
            </CopyToClipboard>}
        </div>
        {error &&
          <div className={css(styles.markdownPreviewError)}>
            We could not generate your markdown at this time
          </div>}
        {!error &&
          <pre className={css(styles.markdownPreviewCode)}>
            {roomMarkdown.content}
          </pre>}
      </div>
    )
  }
}

function PublishMarkdown (
  {
    roomUI,
    roomMarkdown,
    onClick,
    onMarkdownModalRequestClose,
    roomTitle
  }
) {
  return (
    <CardTooltip.LineButton
      onClick={onClick}
      icon='text-file'
      label='View as Markdown'
    >
      <SidewayModal
        isOpen={roomUI && roomUI.showMarkdownModal}
        size='large'
        contentLabel='Markdown Preview'
        onRequestClose={onMarkdownModalRequestClose}
        shouldCloseOnOverlayClick={false}
        closeTimeoutMS={0}
        fullWidth
      >
        <MarkdownPreviewModal
          roomTitle={roomTitle}
          roomMarkdown={roomMarkdown}
        />
      </SidewayModal>
    </CardTooltip.LineButton>
  )
}

const ViewInsights = withRouter(function ViewInsights ({ roomId, history }) {
  return (
    <a className={css(styles.linkLine)} href={`/insight/${roomId}`} target='_blank' rel={'noopener'}>
      <Icon name={'bar-chart'} style={{ width: 28, height: 28, marginRight: 8 }} />
      Conversation Insights
    </a>
  )
})

// This cannot be a functional component because it needs to be measured by Popover
export default class RoomSettingsTooltip extends Component {
  render () {
    const {
      canWrite,
      dispatch,
      roomActive,
      isAdmin,
      isOwner,
      isPublic,
      roomId,
      roomMarkdown,
      roomPending,
      roomUI,
      roomTitle,
      ...passable
    } = this.props

    const canControlRoom = isAdmin || isOwner

    return (
      <CardTooltip.Popover {...passable}>
        <AddToPage dispatch={dispatch} roomId={roomId} />
        {canWrite && roomActive && <ViewInsights roomId={roomId} />}
        {!roomPending && !roomActive &&
          <PublishMarkdown
            roomId={roomId}
            roomTitle={roomTitle}
            roomUI={roomUI}
            roomMarkdown={roomMarkdown}
            onClick={this.handleMarkdownPublishClick}
            onMarkdownModalRequestClose={this.handleMarkdownModalCloseClick}
          />}

        {canControlRoom &&
          <PrivacyToggle
            dispatch={dispatch}
            roomId={roomId}
            isPublic={isPublic}
            isOwner={isOwner}
          />}
        {canControlRoom &&
          roomActive &&
          <EndConversation dispatch={dispatch} roomId={roomId} />}
        {canControlRoom &&
          <DeleteConversation dispatch={dispatch} roomId={roomId} />}
      </CardTooltip.Popover>
    )
  }

  handleMarkdownPublishClick = () => {
    const { dispatch, roomId } = this.props
    dispatch(roomUIActions.showMarkdownModal(roomId))
    dispatch(roomActions.publishMarkdown(roomId))
  };

  handleMarkdownModalCloseClick = () => {
    const { dispatch, roomId } = this.props
    dispatch(roomUIActions.hideMarkdownModal(roomId))
  };
}

const styles = StyleSheet.create({
  markdownPreviewContent: {
    ...font.caption
  },
  mardownPreviewHeader: {
    ...font.body1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 48,
    marginBottom: 16
  },
  mardownPreviewHeaderText: {
    ...font.headline,
    marginRight: 32
  },
  markdownPreviewCode: {
    ...font.caption,
    color: colors.darkgray,
    padding: 4
  },
  markdownPreviewLoading: {
    ...font.display1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '75vh'
  },
  markdownPreviewError: {
    ...font.display1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '75vh',
    color: colors.red
  },
  linkLine: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 4,
    border: '1px solid transparent'
  }
})
