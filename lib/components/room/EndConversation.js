import { Component } from 'react'
import CardTooltip from 'ui/CardTooltip'
import Confirm from 'ui/Confirm'
import { roomActions } from 'redux/rooms'

class EndConversation extends Component {
  state = {
    confirming: false
  };

  render () {
    const { confirming, saving } = this.state

    if (confirming) {
      return (
        <Confirm
          confirmButtonColor='red'
          message='Sure you want to end the conversation?'
          onCancel={this.handleCancel}
          onConfirm={this.handleDeactivation}
          cancelText='No'
          confirmText='End Conversation'
          loading={saving}
        />
      )
    }

    return (
      <CardTooltip.LineButton
        icon='button-circle-cross'
        label='End Conversation'
        danger
        onClick={this.handleInitialClick}
      />
    )
  }

  handleInitialClick = e => {
    this.setState({ confirming: true })
  };

  handleCancel = () => {
    this.setState({ confirming: false, saving: false })
  };

  handleDeactivation = async () => {
    const { dispatch, roomId } = this.props
    this.setState({ saving: true })
    await dispatch(roomActions.patchRoom(roomId, { status: 'completed' }))
    this.handleCancel()
  };
}

export default EndConversation
