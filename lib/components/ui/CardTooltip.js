import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { animation, colors, font } from 'style'
import Button from 'ui/Button'
import Icon from 'art/Icon'

const CardTooltip = {}

// Must have be a class so it can be measured by parent
CardTooltip.Popover = class extends Component {
  render () {
    const {
      animate,
      arrowLeft,
      backgroundColor = colors.white,
      borderColor = colors.fadedgreen,
      children,
      direction = 'top',
      showArrow = true,
      flexDirection = 'column',
      onClick,
      style,
      tooltip
    } = this.props

    return (
      <div
        className={css(
          styles.cardTooltip,
          styles[flexDirection],
          animate && styles.animate
        )}
        style={{
          position: 'absolute',
          backgroundColor,
          borderColor,
          ...style
        }}
        onClick={onClick}
      >
        {tooltip || children}
        {showArrow &&
          <b
            className={css(styles.arrow, styles[direction + 'Border'])}
            style={{
              position: 'absolute',
              left: arrowLeft,
              borderTopColor: borderColor,
              borderBottomColor: borderColor
            }}
          />}
        {showArrow &&
          <b
            className={css(styles.arrow, styles[direction])}
            style={{
              position: 'absolute',
              left: arrowLeft,
              borderTopColor: backgroundColor,
              borderBottomColor: backgroundColor
            }}
          />}
      </div>
    )
  }
}

CardTooltip.LineButton = class LineButton extends Component {
  render () {
    const {
      icon,
      label,
      children,
      color = 'darkgray',
      danger = false,
      style,
      ...rest
    } = this.props

    return (
      <Button
        textOnly
        color={color}
        danger={danger}
        label={label}
        style={{
          ...style,
          display: 'block',
          cursor: 'pointer',
          paddingLeft: 0,
          paddingRight: 0
        }}
        {...rest}
      >
        {icon &&
          <Icon
            name={icon}
            className={css(styles.lineIcon)}
            style={{ width: 28, height: 28, marginRight: 8 }}
          />}
        {label}
        {children}
      </Button>
    )
  }
}

CardTooltip.LineLink = class LineLink extends Component {
  render () {
    const {
      icon,
      label,
      style,
      to,
      openInNewTab,
      ...rest
    } = this.props

    return (
      <a href={to} target='_blank' rel={'noopener'}>
        <Icon name={icon} style={{ width: 28, height: 28, marginRight: 8 }} />
        {children}
      </a>
    )
  }
}

const styles = StyleSheet.create({
  cardTooltip: {
    ...font.body2,
    position: 'absolute',
    minWidth: 32,
    paddingTop: 16,
    paddingRight: 8,
    paddingBottom: 16,
    paddingLeft: 8,
    border: '1px solid',
    cursor: 'initial',
    zIndex: 10
  },
  column: {
    display: 'block'
  },
  row: {
    display: 'flex',
    flexDirection: 'row'
  },
  animate: {
    transform: 'translate3d(0, -50%, 0)',
    opacity: 0,
    transformOrigin: 'top center',
    animationDuration: '150ms',
    animationTimingFunction: animation.timingFn,
    animationFillMode: 'forwards',
    animationName: {
      from: { transform: 'translate3d(0, -50%, 0)', opacity: 0 },
      to: { transform: 'translate3d(0, 0, 0)', opacity: 1 }
    }
  },
  arrow: {
    position: 'absolute',
    marginLeft: -6,
    borderRight: `6px solid ${colors.transparent}`,
    borderLeft: `6px solid ${colors.transparent}`
  },
  top: {
    bottom: -6,
    borderTop: '6px solid'
  },
  topBorder: {
    bottom: -7,
    borderTop: '6px solid'
  },
  bottom: {
    top: -6,
    borderBottom: '6px solid'
  },
  bottomBorder: {
    top: -7,
    borderBottom: '6px solid'
  }
})

export default CardTooltip
