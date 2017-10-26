import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'

export default class SelectBox extends Component {
  constructor (props) {
    super(props)

    this.state = {
      open: false,
      focusedOption: this.props.options.findIndex(
        ({ value }) => value === this.props.value
      )
    }
    this.optionEls = {}
    this.selectingOption = false
  }

  componentDidMount () {
    const selectedOption = this.props.options.find(
      ({ value: optionValue }) => optionValue === this.props.value
    )
    if (
      selectedOption &&
      selectedOption.label &&
      this.optionEls[selectedOption.label]
    ) {
      this.optionEls[selectedOption.label].scrollIntoViewIfNeeded(false)
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (!prevState.open && this.state.open) {
      const selectedOption = this.props.options.find(
        ({ value: optionValue }) => optionValue === this.props.value
      )
      if (
        selectedOption &&
        selectedOption.label &&
        this.optionEls[selectedOption.label]
      ) {
        this.optionEls[selectedOption.label].scrollIntoViewIfNeeded(false)
      }
    }

    if (
      prevState.focusedOption !== this.state.focusedOption &&
      this.state.focusedOption > -1
    ) {
      const label = this.props.options[this.state.focusedOption].label
      this.optionEls[label].scrollIntoViewIfNeeded(false)
    }
  }

  render () {
    const { open, focusedOption } = this.state
    const {
      onChange,
      options,
      placeholder,
      style,
      value
    } = this.props

    const selectedOption = options.find(
      ({ value: optionValue }) => optionValue === value
    )

    return (
      <div
        className={css(styles.select)}
        style={style}
        tabIndex={0}
        role='combobox'
        aria-expanded={open}
        aria-owns={`SelectBox-${placeholder}`}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        onKeyDown={this.handleKeyDown}
      >
        <div>
          {selectedOption && selectedOption.label
            ? selectedOption.label
            : placeholder}
        </div>
        <div className={css(styles.dropArrow)} aria-hidden />
        {open &&
          <div
            id={`SelectBox-${placeholder}`}
            className={css(styles.options)}
            role='listbox'
          >
            {options.map((option, i) => {
              const { label, value: optionValue } = option
              return (
                <div
                  id={`${label}-${optionValue}`}
                  key={`${label}-${optionValue}`}
                  ref={node => {
                    this.optionEls[label] = node
                  }}
                  tabIndex={0}
                  role='option'
                  aria-selected={option === selectedOption}
                  className={css(
                    styles.option,
                    option === selectedOption && styles.selectedOption,
                    focusedOption === i && styles.focusedOption
                  )}
                  onMouseDown={() => {
                    this.setState({
                      focusedOption: options.findIndex(
                        ({ value }) => value === optionValue
                      )
                    })
                    onChange({ value: optionValue, label })
                  }}
                >
                  {label}
                </div>
              )
            })}
          </div>}
      </div>
    )
  }

  handleBlur = () => {
    this.setState({ open: false })
  };

  handleFocus = () => {
    this.setState({ open: true })
  };

  handleKeyDown = e => {
    if (!this.state.open) {
      if (e.keyCode === 40 || e.keyCode === 13) {
        this.setState({ open: true })
      }
      return
    }

    const { focusedOption } = this.state
    const { options, onChange } = this.props

    switch (e.keyCode) {
      case 13: // enter
        onChange(options[focusedOption])
        this.setState({ open: false })
        break
      case 38: // up
        if (focusedOption > 0) {
          this.setState({ focusedOption: focusedOption - 1 })
        }
        break
      case 40: // down
        if (focusedOption < options.length - 1) {
          this.setState({ focusedOption: focusedOption + 1 })
        }
        break
      case 27: // esc
        this.setState({ open: false })
        break
      default:
    }
  };
}

const styles = StyleSheet.create({
  select: {
    ...font.body1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    paddingRight: 20,
    borderRadius: 2,
    backgroundColor: colors.white,
    border: `1px solid ${colors.lightgray}`,
    cursor: 'pointer',
    ':focus': {
      border: `1px solid ${colors.brandgreen}`
    }
  },
  dropArrow: {
    position: 'absolute',
    right: 8,
    top: '50%',
    height: 0,
    width: 0,
    marginTop: '-2px',
    borderColor: colors.transparent,
    borderTopColor: colors.lightgray,
    borderStyle: 'solid',
    borderWidth: '5px 5px 2.5px'
  },
  options: {
    ...font.body2,
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 0,
    left: 0,
    maxHeight: 200,
    overflow: 'auto',
    webkitOverflowScroll: 'touch',
    borderRadius: 2,
    backgroundColor: colors.white,
    border: `1px solid ${colors.lightgray}`,
    zIndex: 4
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: 6,
    paddingRight: 6,
    paddingBottom: 6,
    paddingLeft: 6,
    cursor: 'pointer',
    ':focus': {
      backgroundColor: colors.faintgbrandgreen
    }
  },
  selectedOption: {
    backgroundColor: 'rgba(20, 186, 20, 0.2)'
  },
  focusedOption: {
    backgroundColor: colors.faintgbrandgreen
  }
})
