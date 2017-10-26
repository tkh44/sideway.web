import { Component, DOM } from 'react'
import { omit } from 'lodash'
import { css, StyleSheet } from 'aphrodite/no-important'
import { animation, colors, font } from 'style'

// This cannot be a functional component because it needs to be measured by Popover
export default class BasicTooltip extends Component {
  render () {
    const {
      animate,
      arrowLeft,
      backgroundColor = colors.midgray,
      borderColor = colors.midgray,
      direction,
      onClick,
      style,
      tooltip,
      ...rest
    } = this.props

    if (!tooltip) {
      return DOM.noscript()
    }

    return (
      <div
        {...omit(rest, ['openOnClick'])}
        className={css(styles.tooltip, animate && styles.animate)}
        style={{
          backgroundColor,
          borderColor,
          ...style
        }}
        onClick={onClick}
      >
        <b
          className={css(styles.tooltipArrow, styles[direction])}
          style={{
            position: 'absolute',
            left: arrowLeft,
            borderTopColor: backgroundColor,
            borderBottomColor: backgroundColor
          }}
        />
        {tooltip}
      </div>
    )
  }
}

const styles = StyleSheet.create({
  tooltip: {
    ...font.caption,
    position: 'absolute',
    paddingTop: 2,
    paddingRight: 6,
    paddingBottom: 2,
    paddingLeft: 6,
    color: colors.white,
    borderRadius: 2,
    zIndex: 5,
    whiteSpace: 'nowrap'
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
  tooltipArrow: {
    position: 'absolute',
    left: 20,
    marginLeft: -6,
    borderRight: `6px solid ${colors.transparent}`,
    borderLeft: `6px solid ${colors.transparent}`
  },
  top: {
    bottom: -5,
    borderTop: '6px solid'
  },
  bottom: {
    top: -6,
    borderBottom: '6px solid'
  }
})
