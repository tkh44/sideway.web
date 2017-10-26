import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import Textarea from 'react-textarea-autosize'
import { spring, TransitionMotion } from 'react-motion'
import { roomActions } from 'redux/rooms'
import { colors, commonStyles, font } from 'style'

const LoginToComment = ({ onClick }) => {
  return (
    <div className={css(styles.wrapper, styles.signInNotice)} onClick={onClick}>
      Sign in to comment
    </div>
  )
}

const POPUP_SPRING = { stiffness: 300, damping: 28 }
const willEnter = () => ({ y: 10, opacity: 0 })
const willLeave = () => ({
  y: spring(10, POPUP_SPRING),
  opacity: spring(0, POPUP_SPRING)
})

const QueueFullTooltip = ({ visible = false }) => {
  return (
    <TransitionMotion
      willEnter={willEnter}
      willLeave={willLeave}
      styles={
        visible
          ? [
            {
              key: 'queue-full-tooltip',
              style: {
                y: spring(0, POPUP_SPRING),
                opacity: spring(1, POPUP_SPRING)
              },
              data: null
            }
          ]
          : []
      }
    >
      {currentStyles => {
        return (
          <div>
            {currentStyles.map(config => {
              return (
                <div
                  key={config.key}
                  className={css(styles.tooltip)}
                  style={{
                    transform: `translate3d(0, ${config.style.y}px, 0)`,
                    opacity: config.style.opacity
                  }}
                >
                  Hang on a sec.  The comment queue is full.
                  <b className={css(styles.tooltipArrow)} />
                </div>
              )
            })}
          </div>
        )
      }}
    </TransitionMotion>
  )
}

class CommentInput extends Component {
  constructor (props) {
    super(props)

    this.state = {
      comment: '',
      queueFull: props.commentQueueFull,
      focused: false,
      submitting: false
    }
  }

  componentDidMount () {
    this.mounted = true
  }

  componentWillUnmount () {
    this.mounted = false
  }

  render () {
    const { comment, focused } = this.state
    const { loggedIn, commentQueueFull } = this.props

    if (!loggedIn) {
      return <LoginToComment onClick={this.handleLoginClick} />
    }

    const showQueueFullTooltip = (comment.length || focused) &&
      commentQueueFull

    return (
      <div className={css(styles.wrapper)}>
        <div className={css(styles.inputBorder)}>
          <QueueFullTooltip visible={showQueueFullTooltip} />
          <Textarea
            className={css(styles.input)}
            value={comment}
            onFocus={this.handleInputFocus}
            onBlur={this.handleInputBlur}
            onKeyDown={this.handleKeyDown}
            onChange={this.handleOnChange}
            onHeightChange={this.handleEditorSizeChange}
            name='comment'
            placeholder='Post a comment or a question...'
            minRows={1}
            maxRows={5}
          />
        </div>
      </div>
    )
  }

  handleInputFocus = e => {
    this.setState({ focused: true })
    if (this.props.onFocus) {
      this.props.onFocus(e)
    }
  };

  handleInputBlur = e => {
    this.setState({ focused: false })
    if (this.props.onBlur) {
      this.props.onBlur(e)
    }
  };

  handleKeyDown = e => {
    if (e.keyCode === 13) {
      this.handleSubmit(e)
    }
  };

  handleOnChange = ({ target: { value } }) => {
    this.setState({ comment: value })
  };

  handleEditorSizeChange = editorHeight => {
    this.props.onHeightChange && this.props.onHeightChange(editorHeight)
  };

  handleSubmit = async e => {
    e.preventDefault()

    const { comment } = this.state
    const {
      acceptedFile,
      dispatch,
      roomId,
      commentQueueFull,
      resetDropZone
    } = this.props

    if (commentQueueFull || !comment.length) {
      return
    }

    this.setState({ submitting: true })

    const { ok } = await dispatch(
      roomActions.addComment(roomId, comment, acceptedFile)
    )

    if (!this.mounted) {
      return resetDropZone()
    }

    if (ok) {
      resetDropZone()
    }

    this.setState({
      submitting: false,
      comment: ok ? '' : this.state.comment
    })
  };

  handleLoginClick = () => {
    const { dispatch } = this.props

    dispatch({
      type: 'modal/SHOW',
      payload: { modal: 'login', data: { nextState: window.location.pathname } }
    })
  };
}

const styles = StyleSheet.create({
  wrapper: {
    ...font.body1,
    minHeight: 42,
    marginTop: 0,
    marginBottom: 16
  },
  inputBorder: {
    ...commonStyles.drawnBorder(true, true, true, true, colors.lightgray),
    position: 'relative',
    display: 'flex',
    padding: 2
  },
  input: {
    ...font.body1,
    position: 'relative',
    flex: '1',
    minHeight: 42,
    maxWidth: '100%',
    paddingTop: 8,
    paddingRight: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    margin: 0,
    border: 'none',
    backgroundColor: colors.white
  },
  signInNotice: {
    textAlign: 'center',
    color: colors.brandgreen,
    cursor: 'pointer'
  },
  tooltip: {
    ...font.caption,
    position: 'absolute',
    top: -30,
    left: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    paddingTop: 4,
    paddingRight: 8,
    paddingBottom: 4,
    paddingLeft: 8,
    backgroundColor: colors.midgray,
    color: colors.white,
    borderRadius: 2,
    zIndex: 12
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -6,
    left: 20,
    marginLeft: -6,
    borderTop: `6px solid ${colors.midgray}`,
    borderRight: `6px solid ${colors.transparent}`,
    borderLeft: `6px solid ${colors.transparent}`
  }
})

export default CommentInput
