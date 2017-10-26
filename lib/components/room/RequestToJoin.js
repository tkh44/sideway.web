import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { forms } from 'style'
import FancyTextarea from 'forms/FancyTextarea'
import CardTooltip from 'ui/CardTooltip'
import Button from 'ui/Button'
import SidewayModal from 'modals/SidewayModal'
import { roomActions } from 'redux/rooms'

class RequestToJoinForm extends Component {
  state = {
    message: '',
    submitting: false
  };

  render () {
    const { message, submitting } = this.state

    return (
      <form
        className={css(styles.form)}
        data-ignore-popover-close
        onSubmit={e => {
          e.preventDefault()
        }}
      >
        <legend className={css(styles.inputWrapper)}>
          Request To Join Conversation
        </legend>
        <FancyTextarea
          className={css(styles.input)}
          value={message}
          onChange={this.handleMessageOnChange}
          name='message'
          placeholder='Anything you want to say?'
          maxRows={4}
          minRows={2}
          maxCharCount={127}
        />
        <Button
          color='brandgreen'
          type='submit'
          disabled={submitting}
          label='Send Request To Join'
          onClick={this.handleRequestToJoin}
        >
          Send Request
        </Button>
      </form>
    )
  }

  handleMessageOnChange = e => {
    this.setState({ message: e.target.value })
  };

  handleSubmit = e => {
    e.preventDefault()
    this.handleRequestToJoin()
  };

  handleRequestToJoin = e => {
    e.preventDefault()
    const { message } = this.state
    const { dispatch, roomId, closeModal } = this.props

    dispatch(roomActions.requestToJoin(roomId, message)).then(res => {
      this.setState({ submitting: false }, () => {
        if (res.ok) {
          closeModal()
        }
      })
    })
  };
}

class RequestToJoin extends Component {
  state = {
    modalOpen: false,
    message: { value: '' }
  };

  render () {
    const { loggedIn } = this.props
    const hasPendingRequest = this.hasPendingRequest()

    return (
      <CardTooltip.LineButton
        icon='flag'
        label={
          hasPendingRequest
            ? 'Cancel join request'
            : loggedIn ? 'Request to join' : 'Sign in to join'
        }
        onClick={
          hasPendingRequest ? this.handleCancelRequest : this.handleOpenClick
        }
        color={hasPendingRequest ? 'red' : 'darkgray'}
      >
        {this.renderModal()}
      </CardTooltip.LineButton>
    )
  }

  renderModal () {
    const { modalOpen } = this.state
    const { dispatch, roomId, requests } = this.props

    return (
      <SidewayModal
        isOpen={modalOpen}
        size='small'
        onRequestClose={this.handleCloseClick}
        shouldCloseOnOverlayClick={false}
        closeTimeoutMS={0}
      >
        <RequestToJoinForm
          requests={requests}
          roomId={roomId}
          dispatch={dispatch}
        />
      </SidewayModal>
    )
  }

  handleOpenClick = () => {
    const { modalOpen } = this.state
    const { dispatch, loggedIn } = this.props

    if (!loggedIn) {
      return dispatch({
        type: 'modal/SHOW',
        payload: {
          modal: 'login',
          data: { nextState: window.location.pathname }
        }
      })
    }

    if (modalOpen || this.hasPendingRequest()) {
      return
    }

    this.setState({ modalOpen: true })
  };

  handleCloseClick = () => {
    this.setState({ modalOpen: false })
  };

  handleCancelRequest = () => {
    const { dispatch, roomId } = this.props
    dispatch(roomActions.cancelJoinRequest(roomId))
  };

  hasPendingRequest () {
    const { requests = {}, profile } = this.props
    return profile.id in requests && requests[profile.id] !== null
  }
}

const styles = StyleSheet.create({
  form: {
    ...forms.form
  },
  input: {
    ...forms.textarea
  },
  inputWrapper: {
    ...forms.legend,
    paddingBottom: 12
  }
})

export default RequestToJoin
