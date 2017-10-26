import Color from 'color'

export const utils = {}

utils.color = function color (...args) {
  return new Color(...args)
}

export const colors = {
  transparent: 'rgba(0,0,0,0)',
  white: 'rgb(255, 255, 255)',
  offwhite: '#f8f9fa',
  black: 'rgb(0, 0, 0)',
  darkgray: '#343a40',
  midgray: '#495057',
  lightgray: '#868e96',
  faintgray: '#e9ecef',
  red: 'rgb(215, 130, 130)',
  faintred: 'rgba(215, 130, 130, 0.25)',
  brandgreen: 'rgba(20, 186, 20, 1)',
  faintgbrandgreen: '#d3f9d8',
  midgreen: 'rgba(5, 107, 5, 1)',
  fadedgreen: 'rgba(15, 136, 15, 0.54)',
  darkgreen: 'rgba(10, 85, 10, 1)',
  facebookblue: '#3b5998',
  twitterblue: 'rgb(85, 172, 238)',
  mediumgreen: '#00AB6C'
}

export const font = {
  display3: {
    fontSize: 60,
    lineHeight: 1.145
  },
  display2: {
    fontSize: 45,
    lineHeight: 1.1
  },
  display1: {
    fontSize: 32,
    lineHeight: '40px'
  },
  headline: {
    fontSize: 28,
    lineHeight: 1.25
  },
  title: {
    fontSize: 22,
    lineHeight: 1.4
  },
  body1: {
    fontSize: 18,
    lineHeight: 1.4
  },
  body2: {
    fontSize: 15,
    lineHeight: 1.4
  },
  caption: {
    fontSize: 13,
    lineHeight: 1.2
  },
  tiny: {
    fontSize: 8,
    lineHeight: 1.2
  },
  base: {
    fontSize: 16,
    lineHeight: 1.2
  },
  sansSerifFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Roboto Light", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  monoSpaceFamily: 'Menlo,Monaco,Consolas,"Liberation Mono","Courier New", monospace'
}

export const breakpoints = {
  phone: 420,
  tablet: 700,
  desktop: 960,
  large: 1200
}

export const mediaQueries = {
  phone: `@media only screen and (min-width: ${breakpoints.phone}px)`,
  tablet: `@media only screen and (min-width: ${breakpoints.tablet}px)`,
  desktop: `@media only screen and (min-width: ${breakpoints.desktop}px)`
}

export const animation = {
  timingFn: 'cubic-bezier(0, 0, 0.21, 1)',
  keyframes: {
    slideUpIn: {
      from: {
        transform: 'translate3d(0, 100%, 0)',
        opacity: 0
      },
      to: {
        transform: 'translate3d(0, 0, 0)',
        opacity: 1
      }
    },
    slideRightIn: {
      from: {
        transform: 'translate3d(-200%, 0, 0)',
        opacity: 0.5
      },
      to: {
        transform: 'translate3d(0, 0, 0)',
        opacity: 1
      }
    },
    pulse: {
      from: {
        transform: 'scale3d(1, 1, 1)'
      },
      '50%': {
        transform: 'scale3d(1.05, 1.05, 1.05)'
      },
      to: {
        transform: 'scale3d(1, 1, 1)'
      }
    }
  }
}

export const buttons = {
  textButton: {
    ...font.base,
    color: colors.darkgray,
    background: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    boxShadow: 'none',
    border: 'none',
    paddingTop: 4,
    paddingRight: 8,
    paddingBottom: 4,
    paddingLeft: 8
  },
  grayTextButton: {
    ...this.textButton,
    color: colors.darkgray,
    ':hover': {
      color: Color(colors.darkgray).darken(0.05).rgb().string()
    },
    ':focus': {
      color: Color(colors.darkgray).darken(0.05).rgb().string()
    },
    ':active': {
      color: Color(colors.darkgray).darken(0.05).rgb().string()
    }
  },
  greenTextButton: {
    ...this.textButton,
    color: colors.brandgreen,
    ':hover': {
      color: Color(colors.brandgreen).darken(0.05).rgb().string()
    },
    ':focus': {
      color: Color(colors.brandgreen).darken(0.05).rgb().string()
    },
    ':active': {
      color: Color(colors.brandgreen).darken(0.05).rgb().string()
    }
  },
  redTextButton: {
    ...this.textButton,
    color: colors.red,
    ':hover': {
      color: Color(colors.red).darken(0.05).rgb().string()
    },
    ':focus': {
      color: Color(colors.red).darken(0.05).rgb().string()
    },
    ':active': {
      color: Color(colors.red).darken(0.05).rgb().string()
    }
  }
}

const baseInput = {
  ...font.body1,
  width: '100%',
  padding: 6,
  borderTopLeftRadius: 2,
  borderTopRightRadius: 2,
  borderBottomRightRadius: 2,
  borderBottomLeftRadius: 2,
  backgroundColor: colors.offwhite,
  border: `1px solid ${colors.transparent}`,
  boxShadow: 'none',
  backgroundImage: 'none',
  color: colors.darkgray,
  outline: 'none',
  // WebkitAppearance: 'none'
  '::placeholder': {
    color: colors.lightgray
  }
}

const baseForm = {
  width: '100%',
  display: 'flex',
  flexFlow: 'column nowrap'
}

export const forms = {
  form: {
    ...baseForm
  },
  inlineForm: {
    width: '100%',
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center'
  },
  legend: {
    ...font.title,
    display: 'block',
    width: '100%',
    paddingBottom: 12,
    color: colors.darkgray,
    textAlign: 'center'
  },
  inputContainer: {
    position: 'relative',
    flexGrow: 1,
    marginBottom: 12,
    width: '100%'
  },
  baseInput,
  largeInput: {
    ...baseInput,
    ...font.body1,
    height: 44
  },
  textarea: {
    ...baseInput,
    fontFamily: font.sansSerifFamily,
    resize: 'none',
    // flexGrow: 1,
    marginBottom: 12,
    width: '100%'
  },
  errorMessage: {
    ...font.body2,
    color: colors.red
  }
}

export const commonStyles = {
  overflowEllipsis: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  scrollable: {
    overflowX: 'hidden',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch'
  },

  fancyLink: {
    textDecoration: 'none',
    backgroundImage: 'linear-gradient(to bottom, rgba(20, 186, 20, .8) 25%, rgba(20, 186, 20, 0) 25%)',
    backgroundRepeat: 'repeat-x',
    backgroundSize: '2px 2px',
    backgroundPosition: '0 bottom',
    WebkitTapHighlightColor: 'rgba(20, 186, 20, 0.05)',

    ':hover': {
      color: colors.brandgreen
    }
  },

  opaqueBg: (bgColor = 'rgba(255, 255, 255, 0.98)') => {
    return {
      // Perf is bad...
      WebkitBackdropFilter: 'blur(3px)',
      backdropFilter: 'blur(3px)',
      backgroundColor: bgColor
    }
  },

  drawnBorder: (top, right, bottom, left, borderColor = colors.darkgray) => {
    const common = {
      content: '" "',
      position: 'absolute',
      borderStyle: 'solid',
      borderColor: borderColor,
      borderImageRepeat: 'repeat',
      borderImageWidth: 3,
      borderImageOutset: '2px',
      pointerEvents: 'none'
    }

    const beforeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 630 3" width="630" height="3"><path fill="${borderColor}" stroke="${borderColor}" d="M.106 1.574H21.83c4.97 0 15.65-.674 21.724 0H65.28c5.3 0 14.91.675 21.723 0 6 .675 15.612.675 21.724 0H173.9c6.664.675 15.206 0 21.723 0h21.724c6.996 0 15.54.675 21.725 0h21.724c6.26.675 14.802 0 21.724 0h43.448c6.223.675 14.765-.674 21.724 0h21.724c6.554.675 14.03 0 21.725 0h21.725c6.885.675 15.428-.674 21.724 0h43.447c7.917 0 15.39-.674 21.724 0 6.482-.674 15.024.675 21.725 0h21.725c6.81.675 15.354 0 21.724 0 7.51 0 14.986-.674 21.724 0 6.075.675 15.685.675 21.724 0h21.724"/></svg>`
    const afterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 3 630" width="3" height="630"><path fill="none" stroke="${borderColor}" d="M1.684.17v21.725c0 4.97.674 15.648 0 21.724v21.72c0 5.3-.675 14.91 0 21.722-.675 6.002-.675 15.612 0 21.724v65.173c-.675 6.664 0 15.207 0 21.724v21.724c0 6.995-.675 15.54 0 21.723v21.725c-.675 6.26 0 14.8 0 21.723v43.45c-.675 6.22.674 14.765 0 21.724v21.724c-.675 6.555 0 14.03 0 21.725v21.725c-.675 6.884.674 15.426 0 21.722v43.45c0 7.913.674 15.39 0 21.72.674 6.48-.675 15.023 0 21.725v21.723c-.675 6.81 0 15.353 0 21.723 0 7.51.674 14.987 0 21.725-.675 6.077-.675 15.687 0 21.725v21.724"/></svg>`
    return {
      ':before': {
        ...common,
        top: 1,
        right: 2,
        bottom: 1,
        left: 2,
        borderImageSlice: '100',
        borderImageSource: `url("data:image/svg+xml;base64,${window.btoa(beforeSvg)}")`,
        borderTop: top ? `solid 1px ${borderColor}` : 'solid 0',
        borderRight: 'solid 0',
        borderBottom: bottom ? `solid 1px ${borderColor}` : 'solid 0',
        borderLeft: 'solid 0',
        zIndex: 1
      },
      ':after': {
        ...common,
        top: 2,
        right: 1,
        bottom: 2,
        left: 1,
        borderImageSlice: '100',
        borderImageSource: `url("data:image/svg+xml;base64,${window.btoa(afterSvg)}")`,
        borderTop: 'solid 0',
        borderRight: right ? `solid 1px ${borderColor}` : 'solid 0',
        borderBottom: 'solid 0',
        borderLeft: left ? `solid 1px ${borderColor}` : 'solid 0'
      }
    }
  }
}
