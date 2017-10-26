import { Component } from 'react'
import { trimEnd } from 'lodash'
import { css, StyleSheet } from 'aphrodite/no-important'
import { animation, colors, commonStyles, font } from 'style'
import FancyTextarea from 'forms/FancyTextarea'
import Button from 'ui/Button'
import { roomActions } from 'redux/rooms'

class EditMessage extends Component {
  constructor (props) {
    super(props)

    this.state = {
      text: trimEnd(props.message.text, ' \n'),
      submitting: false,
      editMessageErr: ''
    }
  }

  render () {
    const {
      text,
      editMessageErr
    } = this.state

    const {
      message,
      inputMaxHeight
    } = this.props

    return (
      <form
        ref={el => {
          this.form = el
        }}
        className={css(
          styles.editMessage,
          message.comment && styles.editMessageNoPadding
        )}
      >
        <div className={css(styles.actions)}>
          {editMessageErr &&
            <div className={css(styles.editError)}>
              {editMessageErr}
            </div>}
          <Button
            type='button'
            label='Cancel Edits'
            onClick={this.handleEditCancel}
            danger
            textOnly
            className={css(styles.button)}
            style={{
              maxWidth: 156
            }}
          >
            Cancel
          </Button>
          <Button
            color='brandgreen'
            type='submit'
            label='Save Edits'
            onClick={this.handleEditSave}
            textOnly
            className={css(styles.button)}
            style={{
              maxWidth: 156,
              marginLeft: 16
            }}
          >
            Save
          </Button>
        </div>
        <div className={css(styles.inputBorder)}>
          <FancyTextarea
            ref={el => {
              this.textArea = el
            }}
            className={css(styles.input)}
            style={{ maxHeight: inputMaxHeight }}
            value={text}
            onChange={this.handleTextChange}
            onKeyDown={this.handleKeyDown}
            name='message'
            placeholder={`Edit ${message.comment ? 'comment' : 'message'}`}
            maxCharCount={4 * 1024}
          />
        </div>
      </form>
    )
  }

  handleTextChange = ({ target: { value } }) => this.setState({ text: value });

  handleKeyDown = e => {
    const { keyCode, shiftKey } = e

    if (keyCode === 13 && !shiftKey) {
      this.handleEditSave(e)
    }

    if (keyCode === 27) {
      this.props.onEditCancel()
    }
  };

  handleEditSave = async e => {
    e.preventDefault()

    const { dispatch, message, roomId, onEditCancel } = this.props
    const { ok } = await dispatch(
      roomActions.patchMessage(roomId, message.id, { text: this.state.text })
    )
    if (ok) {
      return onEditCancel()
    }

    this.setState({ editMessageErr: 'Something went wrong editing message' })
  };

  handleEditCancel = e => {
    e.preventDefault()
    this.props.onEditCancel()
  };
}

const styles = StyleSheet.create({
  editMessage: {
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 2,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column'
  },
  editMessageNoPadding: {
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0
  },
  inputBorder: {
    ...commonStyles.drawnBorder(true, true, true, true, colors.fadedgreen),
    order: 0,
    position: 'relative',
    display: 'flex',
    padding: 2
  },
  input: {
    ...font.body1,
    position: 'relative',
    minHeight: 42,
    width: '100%',
    maxWidth: '100%',
    padding: 4,
    margin: 0,
    color: colors.darkgray,
    backgroundColor: colors.white
  },
  actions: {
    order: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    paddingTop: 4,
    paddingRight: 8,
    paddingBottom: 4,
    paddingLeft: 8
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
  },
  editError: {
    ...font.body2,
    marginRight: 'auto',
    color: colors.red
  }
})

export default EditMessage
