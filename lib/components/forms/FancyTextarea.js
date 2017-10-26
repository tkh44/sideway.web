import { Component } from 'react'
import ReactDOM from 'react-dom'
import { css, StyleSheet } from 'aphrodite/no-important'
import Textarea from 'react-textarea-autosize'
import { colors, font, utils } from 'style'
import * as domUtils from 'utils/dom'

export default class FancyTextarea extends Component {
  static defaultProps = {
    highlightColor: colors.faintred,
    maxCharCount: Infinity,
    value: ''
  }

  fixHighlightAnimFrameId = null;

  componentDidMount () {
    const editorEl = ReactDOM.findDOMNode(this.editor)
    this.editor._resizeComponent()
    this.cloneStyles()
    this.fixHighlightsToEditor(editorEl.offsetHeight)
    this.handleEditorScroll()
    this.editor.focus()
  }

  componentDidUpdate (prevProps, prevState) {
    this.fixHighlightsToEditor(ReactDOM.findDOMNode(this.editor).offsetHeight)
  }

  componentWillUnmount () {
    window.cancelAnimationFrame(this.fixHighlightAnimFrameId)
  }

  render () {
    const {
      className,
      maxCharCount,
      highlightColor,
      value,
      ...rest
    } = this.props

    const hasOverflow = value.length > maxCharCount
    const highlights = hasOverflow
      ? [
          { text: value.substr(0, maxCharCount), color: 'transparent' },
          { text: value.substr(maxCharCount), color: highlightColor }
      ]
      : []

    return (
      <div
        ref={el => {
          this.wrapperEl = el
        }}
        className={className}
        style={{
          position: 'relative',
          width: '100%'
        }}
      >
        <div
          ref={el => {
            this.cloneEl = el
          }}
          className={className}
          style={{
            ...rest.style,
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            margin: 0,
            paddingTop: 0,
            paddingRight: domUtils.isIOS ? 3 : 0,
            paddingBottom: 0,
            paddingLeft: domUtils.isIOS ? 3 : 0,
            background: 'none',
            border: 'none',
            pointerEvents: 'none',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}
        >
          {highlights.map((hl, i) => {
            return (
              <mark
                key={hl.text + i}
                style={{
                  display: 'inline',
                  borderRadius: 2,
                  color: 'transparent',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  backgroundColor: hl.color
                }}
              >
                {hl.text}
              </mark>
            )
          })}
        </div>
        <Textarea
          {...rest}
          ref={el => {
            this.editor = el
          }}
          className={className}
          style={{
            ...rest.style,
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            margin: 0,
            padding: 0,
            width: '100%',
            background: 'none',
            border: 'none',
            caretColor: hasOverflow ? colors.red : colors.darkgray
          }}
          value={value}
          onFocus={this.handleFocus}
          onScroll={this.handleEditorScroll}
          onHeightChange={this.handleEditorSizeChange}
        />
        {hasOverflow &&
          <div className={css(styles.charOverage)}>
            {maxCharCount - value.length}
          </div>}
      </div>
    )
  }

  handleFocus = e => {
    const valLength = this.props.value.length

    if (valLength) {
      this.scrollFrameId = window.requestAnimationFrame(() => {
        const textArea = ReactDOM.findDOMNode(this.editor)
        textArea.setSelectionRange(valLength, valLength, 'none')
      })
    }

    if (this.props.onFocus) {
      this.props.onFocus(e)
    }
  };

  handleEditorSizeChange = editorHeight => {
    this.fixHighlightsToEditor(editorHeight)

    if (this.props.onHeightChange) {
      this.props.onHeightChange(editorHeight)
    }
  };

  handleEditorScroll = e => {
    const editorEl = ReactDOM.findDOMNode(this.editor)
    this.cloneEl.scrollTop = editorEl.scrollTop
    this.cloneEl.scrollLeft = editorEl.scrollLeft
    this.fixHighlightsToEditor(editorEl.offsetHeight)

    if (this.props.onScroll) {
      this.props.onScroll(e)
    }
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

  focus = () => {
    this.editor.focus()
  };

  blur = () => {
    this.editor.blur()
  };
}

const styles = StyleSheet.create({
  charOverage: {
    ...font.caption,
    position: 'absolute',
    bottom: 2,
    right: 15,
    fontWeight: 'bold',
    color: utils.color(colors.red).darken(0.25).rgb().string()
  }
})
