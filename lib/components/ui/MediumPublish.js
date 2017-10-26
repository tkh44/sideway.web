import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import SidewayModal from 'modals/SidewayModal'
import Icon from 'art/Icon'
import Button from 'ui/Button'
import { colors, commonStyles, font } from 'style'
import { roomActions } from 'redux/rooms'
import mediumLockupUrl from 'public/images/medium-lockup-dark.png'

class PublishForm extends Component {
  constructor (props) {
    super(props)

    this.state = {
      uploading: false,
      uploadError: null,
      draftUrl: null
    }
  }

  render () {
    return (
      <div className={css(styles.publishFormWrapper)}>
        <img
          src={mediumLockupUrl}
          style={{
            width: '100%'
          }}
        />
        <div className={css(styles.meta)}>
          Create a story from this conversation and upload it to your drafts.
        </div>
        {this.state.uploadError &&
          <div className={css(styles.uploadError)}>
            {this.state.uploadError}
          </div>}
        {this.state.draftUrl &&
          <div className={css(styles.draftUrl)}>
            <a
              className={css(styles.draftLink)}
              href={this.state.draftUrl}
              target='_blank'
              rel='nofollow'
            >
              {this.state.draftUrl}
            </a>
          </div>}
        {!this.state.draftUrl &&
          <div className={css(styles.actionRow)}>
            <Button
              color='darkgray'
              danger
              disabled={this.state.uploading}
              label='Cancel'
              style={{
                width: '50%'
              }}
              onClick={this.handleCancelClick}
            >
              Cancel
            </Button>
            <Button
              color='brandgreen'
              label='Publish to Medium'
              disabled={this.state.uploading}
              style={{
                width: '50%',
                marginLeft: 16
              }}
              onClick={this.handleCreateClick}
            >
              {this.state.uploading ? 'Uploading' : 'Create Story'}
            </Button>
          </div>}
      </div>
    )
  }

  handleCancelClick = () => this.props.closeModal();

  handleCreateClick = async () => {
    const { dispatch, room } = this.props

    this.setState({ uploading: true, uploadError: null })

    const res = await dispatch(roomActions.publishToMedium(room.id))

    if (!res.ok) {
      return this.setState({
        uploading: false,
        uploadError: 'There was an error uploading your story.'
      })
    }

    this.setState({
      uploading: false,
      uploadError: null,
      draftUrl: res.data.url
    })
  };
}

export default class MediumPublish extends Component {
  state = {
    modalOpen: false
  };

  render () {
    const { dispatch, room, style } = this.props

    return (
      <Button
        style={style}
        color='mediumgreen'
        iconOnly
        label='Publish to Medium'
        tooltip='Publish to Medium'
        onClick={this.handleOpenClick}
      >
        <Icon
          name='medium'
          style={{
            height: 36,
            width: 36
          }}
        />
        <SidewayModal
          isOpen={this.state.modalOpen}
          size='large'
          contentLabel='Publish to Medium'
          onRequestClose={this.handleCloseClick}
          shouldCloseOnOverlayClick
          closeTimeoutMS={0}
        >
          <PublishForm dispatch={dispatch} room={room} />
        </SidewayModal>
      </Button>
    )
  }

  handleOpenClick = () => this.setState({ modalOpen: true });

  handleCloseClick = () => this.setState({ modalOpen: false });
}

const styles = StyleSheet.create({
  publishFormWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1
  },
  meta: {
    ...font.body2,
    width: '84%',
    marginBottom: 32
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '84%',
    marginBottom: 32
  },
  draftUrl: {
    marginBottom: 32
  },
  draftLink: {
    ...commonStyles.fancyLink,
    textDecoration: 'underline'
  },
  uploadError: {
    ...font.caption,
    marginBottom: 8,
    color: colors.red
  }
})
