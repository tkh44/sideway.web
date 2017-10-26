import { Component } from 'react'
import CardTooltip from 'ui/CardTooltip'
import { roomActions } from 'redux/rooms'
import Confirm from 'ui/Confirm'

class PrivacyToggle extends Component {
  state = {
    confirming: false,
    saving: false
  };

  render () {
    const { confirming, saving } = this.state
    const { isPublic } = this.props

    if (confirming) {
      return (
        <Confirm
          confirmButtonColor={isPublic ? 'red' : 'brandgreen'}
          message={
            isPublic
              ? 'Make conversation private?'
              : 'Make conversation public?'
          }
          onCancel={this.handleCancel}
          onConfirm={this.handlePrivacyToggle}
          cancelText='No'
          confirmText={`Make ${isPublic ? 'Private' : 'Public'}`}
          loading={saving}
        />
      )
    }

    return (
      <CardTooltip.LineButton
        icon={isPublic ? 'lock' : 'horn'}
        label={`Make conversation ${isPublic ? 'private' : 'public'}`}
        onClick={this.handleInitialClick}
      />
    )
  }

  handleInitialClick = () => {
    this.setState({ confirming: true })
  };

  handleCancel = () => {
    this.setState({ confirming: false, saving: false })
  };

  handlePrivacyToggle = async () => {
    const { dispatch, roomId, isPublic } = this.props
    this.setState({ saving: true })
    await dispatch(roomActions.patchRoom(roomId, { public: !isPublic }))
    this.handleCancel()
  };
}

export default PrivacyToggle
