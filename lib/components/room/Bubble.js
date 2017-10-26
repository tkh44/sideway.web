import { Component } from 'react'
import ReactDOM from 'react-dom'
import { spring, TransitionMotion } from 'react-motion'
import { css, StyleSheet } from 'aphrodite/no-important'
import Textarea from 'react-textarea-autosize'
import listener from 'simple-listen'
import { compareString } from 'utils/string'
import { clamp } from 'utils/func'
import { colors, commonStyles, font } from 'style'
import * as domUtils from 'utils/dom'

const ua = window.navigator.userAgent.toLowerCase()
const isIOS = !!ua.match(/ipad|iphone|ipod/)

const POPUP_SPRING = { stiffness: 300, damping: 28 }
const willEnter = () => ({ y: 10, opacity: 0 })
const willLeave = () => ({
  y: spring(10, POPUP_SPRING),
  opacity: spring(0, POPUP_SPRING)
})

const PublicWarning = ({ visible, onClick }) => {
  return (
    <TransitionMotion
      willEnter={willEnter}
      willLeave={willLeave}
      styles={
        visible
          ? [
            {
              key: 'pub-warning',
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
                  className={css(styles.publicWarning)}
                  style={{
                    transform: `translate3d(0, ${config.style.y}px, 0)`,
                    opacity: config.style.opacity
                  }}
                  onClick={onClick}
                >
                  <b className={css(styles.publicWarningArrow)} />
                  Remember this is a public conversation
                </div>
              )
            })}
          </div>
        )
      }}
    </TransitionMotion>
  )
}

export class Bubble extends Component {
  constructor (props) {
    super(props)

    this.state = {
      text: this.props.input || '',
      lastSavedText: '',
      showWarning: false,
      shownPublicWarning: false
    }

    this.fixHighlightAnimFrameId = null
  }

  componentDidMount () {
    const { input = '' } = this.props
    const editorEl = ReactDOM.findDOMNode(this.editor)
    this.editor._resizeComponent()
    this.editor.focus()
    this.cloneStyles()
    this.keyDownListener = listener(editorEl, 'keydown', this.handleKeyDown)

    if (this.state.text !== input) {
      this.setEditorText(input)
    }
    this.fixHighlightsToEditor(editorEl.offsetHeight)
    this.handleEditorScroll()
  }

  componentWillReceiveProps (nextProps) {
    const { text } = this.state

    if (nextProps.interrupted) {
      const changedAt = compareString(
        this.props.input,
        text,
        nextProps.pos - this.props.pos
      )
      this.setState({ text: text.substr(changedAt) })
    }

    // Server is ahead of local pos.  Can happen from large paste.
    if (nextProps.pos > this.props.pos) {
      const changedAt = compareString(
        this.props.input,
        text,
        nextProps.pos - this.props.pos
      )
      if (changedAt === 0) {
        this.setState({ text: nextProps.input || '' })
      }
    }

    if (this.props.editingMessageId && !nextProps.editingMessageId) {
      this.editor.focus()
    }
  }

  componentDidUpdate (prevProps, prevState) {
    this.fixHighlightsToEditor(ReactDOM.findDOMNode(this.editor).offsetHeight)
  }

  componentWillUnmount () {
    this.keyDownListener()
    window.cancelAnimationFrame(this.fixHighlightAnimFrameId)
    clearTimeout(this.scrollTimeoutId)
  }

  render () {
    const { text, showWarning } = this.state
    const { isBlog, pos, hidden } = this.props
    const previewText = text.substring(
      0,
      clamp(hidden - pos - 1, 0, text.length)
    )
    const hiddenText = text.replace(previewText, '')

    return (
      <div
        ref={el => {
          this.wrapperEl = el
        }}
        className={css(styles.wrapper, isBlog && styles.blogModeWrapper)}
      >
        <PublicWarning
          visible={showWarning}
          onClick={this.handleWarningClick}
        />
        <div
          ref={el => {
            this.cloneEl = el
          }}
          className={css(styles.clone)}
        >
          {previewText.length > 0 &&
            <mark className={css(styles.publicText)}>
              {previewText}
            </mark>}
          {hiddenText.length > 0 &&
            <mark className={css(styles.publicText, styles.hiddenText)}>
              {hiddenText}
            </mark>}
        </div>
        <Textarea
          ref={el => {
            this.editor = el
          }}
          className={css(styles.editor)}
          value={text}
          minRows={1}
          maxRows={16}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          onScroll={this.handleEditorScroll}
          onFocus={this.handleFocus}
          onHeightChange={this.handleEditorSizeChange}
          placeholder='Say anything...'
        />
      </div>
    )
  }

  handleWarningClick = () => {
    this.setState({ showWarning: false })
  };

  handleFocus = e => {
    const { shownPublicWarning } = this.state
    const { isPublic } = this.props

    if (isPublic && shownPublicWarning === false) {
      this.setState({ showWarning: true, shownPublicWarning: true })
    }

    if (this.props.onFocus) {
      this.props.onFocus(e)
    }
  };

  handleKeyDown = e => {
    const { onInputUpKey } = this.props
    const { keyCode, target } = e
    const { value } = target
    const isEnterKey = keyCode === 13
    const isUpKey = keyCode === 38

    if (isEnterKey) {
      this.handleEnterKey(e)
    }

    if (isUpKey) {
      onInputUpKey(e)
    }

    if (value.length > 3 || isEnterKey) {
      this.setState({ showWarning: false })
    }
  };

  handleChange = ({ keyCode, target: { value } }, syncOnChange = true) => {
    if (keyCode === 13 || keyCode === 9) {
      return
    }

    this.setState({ text: value, hasTyped: true })
    this.save(value, false)
  };

  handleBlur = e => {
    const { text } = this.state
    this.save(text)
    if (this.props.onBlur) {
      this.props.onBlur(e)
    }
  };

  handleSubmit = e => {
    e.preventDefault()
  };

  handleEnterKey = e => {
    const { nesDisconnected } = this.props
    const { shiftKey, target } = e
    const { value } = target

    e.preventDefault()

    if (value.length === 0 || nesDisconnected) {
      return
    }

    if (shiftKey) {
      const { selectionStart, selectionEnd } = target
      const beforeCursor = value.substr(0, selectionStart)
      const afterCursor = value.substr(selectionEnd)

      this.setState({ text: afterCursor })
      this.save(beforeCursor + '\n' + afterCursor, true)
      return
    }

    this.save(value + '\n', true)
    this.setState({ text: '' })
  };

  handleEditorSizeChange = editorHeight => {
    this.fixHighlightsToEditor(editorHeight)
    this.props.onHeightChange && this.props.onHeightChange(editorHeight)
  };

  handleEditorScroll = () => {
    const editorEl = ReactDOM.findDOMNode(this.editor)
    this.cloneEl.scrollTop = editorEl.scrollTop
    this.cloneEl.scrollLeft = editorEl.scrollLeft
    this.fixHighlightsToEditor(editorEl.offsetHeight)
  };

  cloneStyles () {
    const stylesToClone = [
      'font-size',
      'font-family',
      'font-style',
      'font-weight',
      'font-variant',
      'font-stretch',
      'vertical-align',
      'word-spacing',
      'text-align',
      'letter-spacing',
      'text-rendering'
    ]

    const editorEl = ReactDOM.findDOMNode(this.editor)
    stylesToClone.forEach(style => {
      this.cloneEl.style[style] = editorEl.style[style]
    })
  }

  setEditorText (text) {
    this.setState({ text })
  }

  save (text, flush = false) {
    if ((!flush && this.state.syncing) || text === this.state.lastSavedText) {
      return
    }

    this.setState({ syncing: true, lastSavedText: text })

    const { pos: positionOffset, input, syncHandler } = this.props
    const textLengthDelta = Math.abs(text.length - input.length)
    const deltaStart = compareString(input, text, input.length)
    const payload = {
      pos: positionOffset + deltaStart,
      input: text.substr(deltaStart)
    }

    if (textLengthDelta > 7 || flush) {
      syncHandler.cancel()
    }

    syncHandler(payload, () => {
      this.setState({ syncing: false }, () => {
        domUtils.scrollToBottom()
      })
    })

    if (textLengthDelta > 7 || flush) {
      syncHandler.flush()
    }
  }

  fixHighlightsToEditor = editorHeight => {
    if (this.fixHighlightAnimFrameId) {
      window.cancelAnimationFrame(this.fixHighlightAnimFrameId)
    }

    this.fixHighlightAnimFrameId = window.requestAnimationFrame(() => {
      if (this.cloneEl && this.wrapperEl) {
        this.cloneEl.style.height = editorHeight + 'px'
        this.wrapperEl.style.height = editorHeight + 'px'
      }
      this.fixHighlightAnimFrameId = null
    })
  };
}

const styles = StyleSheet.create({
  wrapper: {
    ...commonStyles.drawnBorder(true, true, true, true, colors.fadedgreen),
    position: 'relative',
    minHeight: 45,
    marginTop: 0,
    marginBottom: 0,
    WebkitTextSizeAdjust: 'none',
    WebkitScrollSnapCoordinate: '0% 0%'
  },
  blogModeWrapper: {
    marginLeft: 0
  },
  editor: {
    ...font.body1,
    display: 'block',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    minHeight: 45,
    padding: 10,
    margin: 0,
    borderRadius: 0,
    resize: 'none',
    background: 'none',
    border: 'none'
  },
  clone: {
    ...font.body1,
    display: 'block',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    minHeight: 45,
    paddingTop: 10,
    paddingRight: isIOS ? 13 : 10,
    paddingBottom: 10,
    paddingLeft: isIOS ? 13 : 10,
    margin: 0,
    borderRadius: 0,
    resize: 'none',
    background: 'none',
    pointerEvents: 'none',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word'
  },
  publicText: {
    display: 'inline',
    borderRadius: 2,
    color: 'transparent',
    backgroundColor: 'rgba(20, 186, 20, 0.25)',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word'
  },
  hiddenText: {
    color: 'transparent',
    backgroundColor: 'transparent'
  },
  publicWarning: {
    ...font.caption,
    position: 'absolute',
    top: -30,
    left: 4,
    height: 24,
    paddingTop: 4,
    paddingRight: 8,
    paddingBottom: 4,
    paddingLeft: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(126, 126, 126, 0.87)',
    borderRadius: 2,
    color: colors.white,
    zIndex: 12,
    cursor: 'pointer'
  },
  publicWarningArrow: {
    position: 'absolute',
    bottom: -6,
    left: 20,
    marginLeft: -8,
    borderTop: '6px solid rgba(123, 123, 123, 0.87)',
    borderRight: '6px solid transparent',
    borderLeft: '6px solid transparent'
  }
})

export default Bubble
