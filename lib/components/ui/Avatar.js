import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'
import cn from 'classnames'

const createInitials = (name = '') => {
  const splitName = name.split(' ')

  if (splitName.length > 1) {
    return splitName
      .filter((part, i, list) => {
        return i === 0 || i === list.length - 1
      })
      .map(s => s.charAt(0))
      .join('')
      .toUpperCase()
  }

  return splitName[0].substr(0, 2).toUpperCase()
}

class Avatar extends Component {
  static defaultProps = {
    user: {},
    fade: false,
    present: false,
    decorate: true,
    size: 'medium'
  };

  state = {
    loaded: false,
    error: false
  };

  componentDidMount () {
    this.preloadAvatar(this.props)
  }

  componentWillReceiveProps (nextProps) {
    const avatar = this.props.user.avatar
    const nextAvatar = nextProps.user.avatar

    if (avatar !== nextAvatar) {
      this.preloadAvatar(nextProps)
    }
  }

  render () {
    const {
      user: {
        id,
        avatar = '',
        owner,
        disabled,
        display = '',
        name = '',
        username = ''
      },
      style = {},
      className = '',
      fade,
      present,
      decorate,
      size
    } = this.props

    return (
      <div
        key={'avatar-user-avatar-' + id}
        ref={el => {
          this.el = el
        }}
        className={cn(
          className,
          css(
            styles.avatar,
            styles[size],
            (disabled || fade) && styles.disabled
          )
        )}
        style={{
          ...style,
          backgroundImage: avatar && this.state.loaded
            ? `url("${avatar}")`
            : 'none'
        }}
      >
        {(!avatar || this.state.error) &&
          <div
            ref={el => {
              this.initials = el
            }}
            className={css(styles.initials, styles[`${size}Initials`])}
          >
            {createInitials(display || name || username)}
          </div>}
        {decorate &&
          present &&
          <div
            className={css(
              styles.presentIndicator,
              (disabled || fade) && styles.disabledPresentIndicator
            )}
          />}
        {decorate &&
          owner &&
          <div
            className={css(
              styles.ownerIndicator,
              (disabled || fade) && styles.disabledOwnerIndicator
            )}
          />}
      </div>
    )
  }

  preloadAvatar = props => {
    const { user } = props

    if (!user.avatar) {
      return
    }

    const img = new window.Image()
    img.onload = () => {
      this.setState({ loaded: true, error: false })
    }
    img.onerror = () => {
      this.setState({ loaded: false, error: true })
    }
    img.src = user.avatar
  };
}

const styles = StyleSheet.create({
  avatar: {
    position: 'relative',
    flex: 'none',
    width: '100%',
    height: '100%',
    borderRadius: 2,
    backgroundSize: 'contain',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backfaceVisibility: 'hidden'
  },
  small: {
    height: 24,
    width: 24
  },
  medium: {
    height: 28,
    width: 28
  },
  large: {
    height: 36,
    width: 36
  },
  xlarge: {
    height: 48,
    width: 48
  },
  initials: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    height: '100%',
    width: '100%',
    backgroundColor: colors.fadedgreen,
    color: colors.white,
    borderRadius: 2,
    whiteSpace: 'nowrap'
  },
  smallInitials: {
    ...font.caption
  },
  mediumInitials: {
    ...font.body2
  },
  largeInitials: {
    ...font.body1
  },
  xlargeInitials: {
    ...font.body1
  },
  presentIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: '50%',
    backgroundColor: colors.brandgreen,
    width: 8,
    height: 8
  },
  ownerIndicator: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    height: 6,
    borderBottom: `2px solid ${colors.brandgreen}`
  },
  disabled: {
    filter: 'grayscale(100%)'
  },
  disabledPresentIndicator: {
    display: 'none'
  },
  disabledOwnerIndicator: {
    borderBottom: `2px solid ${colors.lightgray}`
  }
})

export default Avatar
