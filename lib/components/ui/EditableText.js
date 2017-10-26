import { Component } from 'react'
import cn from 'classnames'
import FancyTextarea from 'forms/FancyTextarea'
import FormattedText from 'ui/FormattedText'

export default class EditableText extends Component {
  static defaultProps = {
    blurOnEnterPress: false,
    hasError: false,
    isFetching: false,
    minRows: 1,
    maxRows: 5,
    renderFormattedText: false,
    formattedTextLinks: []
  };

  state = {
    editing: false
  };

  scrollPosition = null;

  componentDidUpdate (prevProps, prevState) {
    if (!prevState.editing && this.state.editing) {
      this.textarea.focus()
    }
  }

  render () {
    const { editing } = this.state
    const {
      className,
      editClassName,
      formattedTextLinks,
      maxCharCount,
      maxRows,
      minRows,
      onChange,
      placeholder,
      placeholderClassName,
      renderFormattedText,
      textClassName,
      value
    } = this.props

    if (editing) {
      return (
        <FancyTextarea
          ref={el => {
            this.textarea = el
          }}
          className={cn(className, editClassName)}
          placeholder={placeholder}
          value={value}
          onBlur={this.handleBlur}
          onChange={onChange}
          onKeyDown={this.handleKeyDown}
          maxCharCount={maxCharCount}
          maxRows={maxRows}
          minRows={minRows}
        />
      )
    }

    if (renderFormattedText) {
      return (
        <div
          className={className}
          role='button'
          aria-label={placeholder}
          onClick={this.handleTextClick}
          tabIndex={0}
        >
          <FormattedText
            className={cn(textClassName, !value && placeholderClassName)}
            text={value || placeholder}
            links={formattedTextLinks}
            displayNodesAsBlocks
          />
        </div>
      )
    }

    return (
      <div
        className={cn(className)}
        onClick={this.handleTextClick}
        tabIndex={0}
      >
        <div className={cn(textClassName, !value && placeholderClassName)}>
          {value || placeholder}
        </div>
      </div>
    )
  }

  handleTextClick = e => {
    const { onClick, isFetching } = this.props
    if (!isFetching) {
      this.setState({ editing: true })
    }
    if (onClick) onClick(e)
  };

  handleKeyDown = e => {
    const { blurOnEnterPress, onKeyDown } = this.props

    if (blurOnEnterPress && e.keyCode === 13) {
      e.preventDefault()
      this.textarea.blur()
    }

    onKeyDown && onKeyDown(e)
  };

  handleBlur = e => {
    const { onBlur } = this.props
    this.setState({ editing: false })

    if (onBlur) onBlur(e)
  };
}
