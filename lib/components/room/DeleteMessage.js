import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { animation, colors, font, utils } from 'style'
import Button from 'ui/Button'
import { roomActions } from 'redux/rooms'
import { roomUIActions } from 'redux/room-ui'

export default class DeleteMessage extends Component {
  state = {
    submitting: false,
    error: null
  };

  render () {
    const { error, submitting } = this.state
    const { children, message } = this.props

    return (
      <form
        ref={el => {
          this.form = el
        }}
        className={css(
          styles.deleteMessage,
          message.comment && styles.noPadding
        )}
      >
        <del
          style={{ color: utils.color(colors.red).darken(0.25).rgb().string() }}
        >
          {children}
        </del>
        <div className={css(styles.actions)}>
          <Button
            type='button'
            label='Do Not Delete Message'
            onClick={this.handleCancel}
            className={css(styles.button)}
            style={{
              maxWidth: 156
            }}
          >
            Cancel
          </Button>
          <Button
            color='red'
            type='submit'
            label='Delete Message'
            disabled={submitting}
            onClick={this.handleSave}
            className={css(styles.button)}
            style={{
              maxWidth: 156,
              marginLeft: 16
            }}
          >
            {submitting ? 'Deleting' : 'Delete'}
          </Button>
        </div>
        {error &&
          <div className={css(styles.error)}>
            {error}
          </div>}
      </form>
    )
  }

  handleSave = async e => {
    e.preventDefault()
    const { dispatch, message, roomId } = this.props
    this.setState({ submitting: true })
    const res = await dispatch(roomActions.deleteMessage(roomId, message.id))
    if (res.ok) {
      dispatch(roomUIActions.setDeleteMessageId({ roomId, messageId: null }))
      return
    }

    this.setState({
      submitting: false,
      error: 'We could not delete the message at this time'
    })
  };

  handleCancel = e => {
    e.preventDefault()
    const { dispatch, roomId } = this.props
    dispatch(roomUIActions.setDeleteMessageId({ roomId, messageId: null }))
  };
}

const styles = StyleSheet.create({
  deleteMessage: {
    marginBottom: 16,
    borderRadius: 2,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column'
  },
  noPadding: {
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0
  },
  error: {
    ...font.caption,
    textAlign: 'right',
    color: colors.red
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    width: '100%'
  },
  button: {
    transform: 'perspective(1000px) translate3d(0, -110%, -200px)',
    animationDuration: '150ms',
    animationTimingFunction: animation.timingFn,
    animationFillMode: 'forwards',
    animationName: {
      from: { transform: 'perspective(1000px) translate3d(0, -110%, -200px)' },
      to: { transform: 'perspective(1000px) translate3d(0, 0, 0)' }
    }
  }
})
