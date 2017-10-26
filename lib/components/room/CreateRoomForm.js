import { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import withRouter from 'react-router-dom/es/withRouter'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, forms } from 'style'
import Icon from 'art/Icon'
import { sitrep } from 'redux/sitrep'
import { roomActions } from 'redux/rooms'
import { roomUIActions } from 'redux/room-ui'
import Popover from 'ui/Popover'
import BasicTooltip from 'ui/BasicTooltip'

class CreateRoomForm extends Component {
  state = {
    submitting: false,
    room: { value: '' }
  };

  render () {
    const { room, submitting } = this.state

    return (
      <form className={css(styles.createRoomForm)} onSubmit={this.handleSubmit}>
        <input
          className={css(styles.input)}
          onChange={this.handleRoomChange}
          name='Room Name'
          type='roomName'
          value={room.value}
          placeholder='What do you want to discuss?'
          aria-label='What do you want to discuss?'
        />
        <Popover
          component='button'
          disabled={submitting}
          type='submit'
          className={css(styles.createButton)}
          arrowSize={8}
          popoverComponent={BasicTooltip}
          popoverProps={{
            tooltip: 'Create Conversation',
            style: {
              width: 'auto'
            }
          }}
        >
          <Icon
            className={css(styles.addIcon)}
            name='add'
            fill='rgba(255, 255, 255, 1)'
            style={{
              width: 38,
              height: 38
            }}
          />
        </Popover>
      </form>
    )
  }

  handleRoomChange = e => {
    const { value } = e.target

    this.setState({ room: { ...this.state.room, value } })
  };

  handleSubmit = e => {
    e.preventDefault()

    const { room } = this.state

    if (!room.value) {
      return
    }

    this.setState({ submitting: true })
    this.createRoom(room.value)
  };

  async createRoom (about) {
    const { dispatch, history: { push } } = this.props

    const res = await dispatch(roomActions.createRoom(about))

    if (!res.ok) {
      let message = `We couldn't create ${about}`

      if (res.status === 403) {
        message = 'Creating rooms is current by invite only. You can enter an invite code by updating your profile.'
      }

      dispatch(sitrep.error({ duration: 5000, message }))
      return this.setState({
        room: { ...this.state.room, error: true },
        submitting: false
      })
    }

    this.setState({ submitting: false, room: { value: '' } })
    dispatch(roomUIActions.enableRoomIntro({ roomId: res.data.id }))
    push(`/room/${res.data.id}`)
  }
}

const styles = StyleSheet.create({
  createRoomForm: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 16
  },
  input: {
    ...forms.largeInput,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  createButton: {
    position: 'relative',
    display: 'flex',
    flex: 'none',
    width: 44,
    height: 44,
    background: colors.brandgreen,
    border: `1px solid ${colors.transparent}`,
    borderLeft: 'none',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    ':hover': {
      backgroundColor: colors.brandgreen
    },
    ':focus': {
      outline: 0
    }
  },
  addIcon: {
    position: 'absolute',
    top: 2,
    left: 3
  }
})

export default compose(connect(null, null, null, { pure: false }), withRouter)(
  CreateRoomForm
)
