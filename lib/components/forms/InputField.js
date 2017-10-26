import { cloneElement, Component } from 'react'
import { omit } from 'lodash'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font, forms } from 'style'

const getPassableProps = props =>
  omit(props, [
    'available',
    'className',
    'children',
    'error',
    'invalid',
    'initialValue',
    'isInline',
    'loading',
    'mask',
    'label',
    'defaultValue',
    'style'
  ])

class InputField extends Component {
  static defaultProps = {
    type: 'text',
    invalid: false,
    label: '',
    mask: false,
    required: false,
    loading: false,
    initialValue: ''
  };

  state = {
    active: false,
    touched: false
  };

  render () {
    const { touched, active } = this.state
    const {
      error,
      value = '',
      children,
      label,
      isInline,
      style,
      initialValue
    } = this.props
    const passable = getPassableProps(this.props)

    return (
      <div
        ref={el => {
          this.headerEl = el
        }}
        className={css(
          styles.inputWrapper,
          isInline && styles.inlineWrapper,
          isInline && label && styles.inlineWrapperWithLabel
        )}
        style={style}
      >
        <label
          className={css(
            styles.label,
            touched && error && styles.labelError,
            isInline && styles.inlineLabel
          )}
        >
          {label}
          <input
            ref={el => {
              this.inputEl = el
            }}
            className={css(
              styles.input,
              isInline && styles.inlineInput,
              touched && error && styles.invalid
            )}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            value={value}
            {...passable}
          />
        </label>
        {children &&
          cloneElement(children, {
            active,
            touched,
            value,
            initialValue,
            hasLabel: !!label
          })}
      </div>
    )
  }

  handleFocus = e => {
    this.setState({ active: true, touched: true })

    if (this.props.onFocus) {
      this.props.onFocus(e)
    }
  };

  handleBlur = e => {
    this.setState({ active: false })

    if (this.props.onBlur) {
      this.props.onBlur(e)
    }
  };

  focus = () => {
    this.inputEl.focus()
  };

  blur = () => {
    this.inputEl.blur()
  };
}

const styles = StyleSheet.create({
  inputWrapper: {
    position: 'relative',
    flexGrow: 1,
    width: '100%',
    marginBottom: 12
  },
  inlineWrapper: {
    flexShrink: 1,
    marginRight: 8,
    marginBottom: 0
  },
  inlineWrapperWithLabel: {
    marginTop: 14
  },
  input: {
    ...forms.baseInput
  },
  inlineInput: {
    height: '100%'
  },
  invalid: {
    border: `1px solid ${colors.red}`
  },
  label: {
    ...font.caption,
    display: 'block',
    color: colors.lightgray,
    marginBottom: 2
  },
  inlineLabel: {
    marginBottom: 0
  },
  labelError: {
    color: colors.red
  }
})

export default InputField
