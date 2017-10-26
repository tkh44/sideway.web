import { Component } from 'react'
import { findDOMNode } from 'react-dom'
import { spring, TransitionMotion } from 'react-motion'
import { css, StyleSheet } from 'aphrodite/no-important'
import { breakpoints, colors, font } from 'style'
import FormattedText from 'ui/FormattedText'
import FancyTextarea from 'forms/FancyTextarea'
import Icon from 'art/Icon'
import Button from 'ui/Button'
import { roomActions } from 'redux/rooms'
import { roomUIActions } from 'redux/room-ui'
import * as domUtils from 'utils/dom'

const PANEL_SPRING = { stiffness: 300, damping: 28 }

class EditableTopic extends Component {
  constructor (props) {
    super(props)
    this.state = {
      focused: false,
      topic: props.topic,
      saving: false,
      error: null
    }
  }

  componentWillReceiveProps (nextProps) {
    const nextState = {}
    if (
      this.props.topic !== nextProps.topic &&
      document.activeElement !== findDOMNode(this.topicInput)
    ) {
      nextState.topic = nextProps.title
      this.setState({ topic: nextProps.topic })
    }
  }

  componentWillUpdate (nextProps, nextState) {
    if (!this.state.focused && nextState.focused) {
      this.scrollToBottom = domUtils.isScrolledToBottom(50)
    }
  }

  componentDidUpdate () {
    if (this.scrollToBottom) {
      domUtils.scrollToBottom()
      this.scrollToBottom = false
    }
  }

  render () {
    const { error, topic } = this.state

    return (
      <div className={css(styles.topicWrapper)} style={this.props.style}>
        {error &&
          typeof error !== 'boolean' &&
          <div className={css(styles.error)}>
            {error}
          </div>}
        <div className={css(styles.topicForm)}>
          <FancyTextarea
            ref={el => {
              this.textarea = el
            }}
            className={css(
              styles.topicText,
              styles.editable,
              styles.isEditing,
              error && styles.fieldError
            )}
            placeholder={
              topic && topic.length
                ? 'Edit announcement'
                : 'Add an announcement'
            }
            value={topic}
            onKeyDown={this.handleKeyDown}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            maxRows={5}
            minRows={1}
            maxCharCount={127}
          />
          <Button
            color={topic && topic.length ? 'red' : 'darkgray'}
            iconOnly
            label={
              topic && topic.length
                ? 'Remove announcement'
                : 'Cancel announcement'
            }
            tooltip
            onClick={this.handleCancelClick}
            style={{
              height: 32,
              width: 32,
              marginTop: 10
            }}
          >
            <Icon
              name='close'
              style={{
                height: 32,
                width: 32
              }}
            />
          </Button>
        </div>
      </div>
    )
  }

  handleKeyDown = e => {
    if (e.keyCode === 13) {
      e.preventDefault()
      this.textarea.blur()
    }
  };

  handleChange = ({ target: { value } } = {}) =>
    this.setState({ topic: value, error: value.length > 127 });

  handleFocus = () => this.setState({ focused: true });

  handleBlur = async () => {
    const { dispatch, roomId } = this.props

    if (this.state.error) return

    if (this.state.topic !== this.props.topic) {
      this.setState({ saving: true, focused: false })
      const res = await dispatch(
        roomActions.putTopic(roomId, this.state.topic)
      )

      if (res.ok) {
        this.setState({ saving: false })
      } else {
        this.setState({
          saving: false,
          error: 'We could not create your announcement at this time'
        })
      }
    } else {
      this.setState({ focused: false })
    }
  };

  handleCancelClick = async () => {
    const { dispatch, roomId } = this.props

    if (this.state.saving) {
      return
    }

    if (this.state.topic && this.state.topic.length) {
      this.setState({ saving: true })
      const res = await dispatch(roomActions.putTopic(roomId, ''))

      if (res.ok) {
        this.setState({ saving: false, error: null })
      } else {
        this.setState({
          saving: false,
          error: 'We could not remove the announcement at this time'
        })
      }
    }

    dispatch(
      roomUIActions.setShowTopicInput({ roomId, showTopicInput: false })
    )
  };
}

const StaticTopic = ({ style, topic }) => {
  return (
    <div className={css(styles.topicWrapper)} style={style}>
      <span className={css(styles.topicText, styles.staticTopicText)}>
        <FormattedText text={topic} links={[]} displayNodesAsBlocks={false} />
      </span>
    </div>
  )
}

export default class RoomTopic extends Component {
  render () {
    const styles = this.getStyles()

    return (
      <TransitionMotion
        willEnter={this.willEnter}
        willLeave={this.willLeave}
        styles={styles}
      >
        {currentStyles => (
          <div>
            {currentStyles.map(config => {
              const { data: C, style, key } = config
              return (
                <C
                  key={key}
                  {...this.props}
                  style={{
                    ...this.props.style,
                    transform: `perspective(1000px) translate3d(0, 0, ${style.z}px)`,
                    transformOrigin: 'center',
                    opacity: style.opacity
                  }}
                />
              )
            })}
          </div>
        )}
      </TransitionMotion>
    )
  }

  getStyles = () => {
    const { roomActive, isOwner, isAdmin, showTopicInput, topic } = this.props

    if (!roomActive) {
      return []
    }

    if (isOwner || isAdmin) {
      if (topic || showTopicInput) {
        return [
          {
            key: 'editable-topic',
            data: EditableTopic,
            style: {
              z: spring(0, PANEL_SPRING),
              opacity: spring(1, PANEL_SPRING)
            }
          }
        ]
      }
    } else if (topic) {
      return [
        {
          key: 'static-topic',
          data: StaticTopic,
          style: {
            z: spring(0, PANEL_SPRING),
            opacity: spring(1, PANEL_SPRING)
          }
        }
      ]
    }

    return []
  };

  willEnter = () => ({ z: -100, opacity: 0 });

  willLeave = () => null;
}

const styles = StyleSheet.create({
  topicWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: breakpoints.tablet
  },
  topicForm: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%'
  },
  error: {
    ...font.caption,
    paddingBottom: 4,
    color: colors.red,
    textAlign: 'center'
  },
  topicText: {
    ...font.body1,
    width: '100%',
    whiteSpace: 'pre-wrap',
    color: colors.darkgray
  },
  staticTopicText: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: 16,
    paddingRight: 16,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderLeft: `4px solid ${colors.brandgreen}`
  },
  editable: {
    borderBottom: '1px solid transparent',
    cursor: 'pointer',
    ':active': {
      cursor: 'text'
    },
    ':hover': {
      borderBottom: `1px solid ${colors.brandgreen}`
    },
    ':focus': {
      borderBottom: `1px solid ${colors.brandgreen}`,
      cursor: 'text'
    }
  },
  fieldError: {
    borderBottom: `1px solid ${colors.red}`,
    cursor: 'pointer',
    ':active': {
      cursor: 'text'
    },
    ':hover': {
      borderBottom: `1px solid ${colors.red}`
    },
    ':focus': {
      borderBottom: `1px solid ${colors.red}`,
      cursor: 'text'
    }
  },
  isEditing: {
    cursor: 'initial'
  },
  textClassName: {
    whiteSpace: 'pre-wrap'
  },
  placeholderClassName: {
    color: colors.lightgray
  }
})
