import Color from 'color'
import defaultProps from 'recompose/defaultProps'
import { css, StyleSheet } from 'aphrodite/no-important'
import { animation, colors, commonStyles, font } from 'style'
import Popover from 'ui/Popover'
import BasicTooltip from 'ui/BasicTooltip'
import { breakpoints } from '../../style'

export default defaultProps({
  color: 'darkgray',
  danger: false,
  type: 'button',
  textOnly: false,
  iconOnly: false,
  isInline: false,
  label: '',
  loading: false,
  tooltip: false
})(({
  children,
  color,
  danger,
  iconOnly,
  isInline,
  loading,
  style,
  label,
  textOnly,
  tooltip,
  ...rest
}) => {
  const buttonProps = {
    tabIndex: 0,
    ...rest,
    className: css(
      styles.button,
      styles[color],
      danger && styles.dangerButton,
      isInline && styles.isInline,
      textOnly && styles.textOnly,
      iconOnly && styles.iconButton,
      loading && styles.loading
    ),
    style: {
      borderColor: textOnly || iconOnly || color === 'solidGreenButton'
        ? colors.transparent
        : 'currentColor',
      ...style
    },
    'aria-label': label
  }

  if (tooltip) {
    return (
      <Popover
        component='button'
        hoverDelay={500}
        popoverComponent={BasicTooltip}
        popoverProps={{
          tooltip: typeof tooltip === 'boolean' ? label : tooltip
        }}
        {...buttonProps}
      >
        <span className={css(styles.buttonInner)} label={buttonProps.label}>
          {children}
        </span>
      </Popover>
    )
  }

  return (
    <button {...buttonProps}>
      <span className={css(styles.buttonInner)}>
        {children}
      </span>
    </button>
  )
})

const buttonBase = {
  ...font.base,
  position: 'relative',
  background: 'none',
  outline: 'none',
  fontFamily: 'inherit',
  boxShadow: 'none',
  border: 'none',
  paddingTop: 4,
  paddingRight: 8,
  paddingBottom: 4,
  paddingLeft: 8,
  cursor: 'pointer',
  ':focus': {
    outline: 0
  }
}

const generateButtonColors = color => {
  const activeColor = color === colors.darkgray ? colors.brandgreen : color
  const darkenedColor = Color(activeColor).darken(0.20).rgb().string()

  const styles = {
    outline: 'none',
    backgroundColor: colors.white,
    ':hover:not(:disabled)': {
      color: darkenedColor
    },
    ':active:not(:disabled)': {
      color: darkenedColor
    },
    ':focus:not(:disabled)': {
      color: darkenedColor
    },
    ':disabled': {
      color: colors.lightgray,
      boxShadow: 'none',
      cursor: 'not-allowed'
    }
  }

  if (color !== colors.transparent) {
    styles.color = color
  }

  return styles
}

const styles = StyleSheet.create({
  button: {
    ...buttonBase,
    ...font.body1,
    position: 'relative',
    // flex: 1,
    maxWidth: breakpoints.phone,
    textAlign: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 2,
    transition: `background-color 200ms ${animation.timingFn}, border 200ms ${animation.timingFn}, color 200ms ${animation.timingFn}`
  },
  buttonInner: {
    ...commonStyles.overflowEllipsis,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  isInline: {
    // height: 35,
    width: 'auto',
    minWidth: 64,
    margin: 0,
    paddingTop: 4,
    paddingRight: 4,
    paddingBottom: 4,
    paddingLeft: 4
  },
  darkgray: {
    ...generateButtonColors(colors.darkgray)
  },
  brandgreen: {
    ...generateButtonColors(colors.brandgreen)
  },
  red: {
    ...generateButtonColors(colors.red)
  },
  white: {
    ...generateButtonColors(colors.white)
  },
  facebookblue: {
    ...generateButtonColors(colors.facebookblue)
  },
  twitterblue: {
    ...generateButtonColors(colors.twitterblue)
  },
  mediumgreen: {
    ...generateButtonColors(colors.mediumgreen)
  },
  solidGreenButton: {
    outline: 'none',
    color: colors.white,
    backgroundColor: colors.brandgreen,
    ':hover:not(:disabled)': {
      backgroundColor: Color(colors.brandgreen).darken(0.20).rgb().string()
    },
    ':active:not(:disabled)': {
      backgroundColor: Color(colors.brandgreen).darken(0.20).rgb().string()
    },
    ':focus:not(:disabled)': {
      backgroundColor: Color(colors.brandgreen).darken(0.20).rgb().string()
    },
    ':disabled': {
      color: colors.lightgray,
      boxShadow: 'none',
      cursor: 'not-allowed'
    }
  },
  dangerButton: {
    outline: 'none',
    color: colors.darkgray,
    backgroundColor: colors.white,
    ':hover:not(:disabled)': {
      color: Color(colors.red).darken(0.20).rgb().string()
    },
    ':active:not(:disabled)': {
      color: Color(colors.red).darken(0.20).rgb().string()
    },
    ':focus:not(:disabled)': {
      color: Color(colors.red).darken(0.20).rgb().string()
    },
    ':disabled': {
      color: colors.lightgray,
      boxShadow: 'none',
      cursor: 'not-allowed'
    }
  },
  iconButton: {
    flex: 'none',
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    height: 'auto',
    backgroundColor: 'none'
  },
  iconButtonInner: {
    position: 'static'
  },
  textOnly: {
    ...font.body2,
    backgroundColor: colors.transparent
  },
  loading: {
    animationName: animation.keyframes.pulse,
    animationDuration: '1s',
    animationIterationCount: 'infinite'
  }
})

const Box = x => ({
  map: fn => Box(fn(x)),
  fold: fn => fn(x)
})
