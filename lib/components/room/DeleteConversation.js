import { Component } from 'react'
import CardTooltip from 'ui/CardTooltip'
import Confirm from 'ui/Confirm'
import withRouter from 'react-router-dom/es/withRouter'
import { roomActions } from 'redux/rooms'

class DeleteConversation extends Component {
  state = {
    confirming: false,
    saving: false
  };

  render () {
    const { confirming, saving } = this.state

    if (confirming) {
      return (
        <Confirm
          confirmButtonColor='red'
          message='Sure you want to delete?'
          onCancel={this.handleCancel}
          onConfirm={this.deleteRoom}
          cancelText='No'
          confirmText='Delete Conversation'
          loading={saving}
        />
      )
    }

    return (
      <CardTooltip.LineButton
        icon='trash'
        label='Delete Conversation'
        onClick={this.handleInitialClick}
        danger
      />
    )
  }

  handleInitialClick = e => this.setState({ confirming: true });

  handleCancel = () => this.setState({ confirming: false, saving: false });

  deleteRoom = async () => {
    const { dispatch, roomId, history: { push } } = this.props
    this.setState({ saving: true })
    await dispatch(roomActions.deleteRoom(roomId))
    push('/')
  };
}

export default withRouter(DeleteConversation)
