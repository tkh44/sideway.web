import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { breakpoints, colors, font, mediaQueries } from 'style'

class Notification extends Component {
  constructor (props) {
    super(props)

    this.handleWrapperClick = this.handleWrapperClick.bind(this)
  }

  render () {
    const { message, type, style } = this.props

    return (
      <div
        className={css(styles.notification, styles[type])}
        style={style}
        onClick={this.handleWrapperClick}
      >
        <p className={css(styles.message)}>
          {message}
        </p>
      </div>
    )
  }

  handleWrapperClick () {
    const { dismiss, id } = this.props

    dismiss(id)
  }
}

const styles = StyleSheet.create({
  notification: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: breakpoints.tablet,
    paddingTop: 4,
    paddingRight: 2,
    paddingBottom: 4,
    paddingLeft: 2,
    color: colors.white,
    backgroundColor: colors.white,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 2,
    borderBottomLeftRadius: 2,
    textAlign: 'center',
    borderTop: 'none',
    borderLeft: '1px solid',
    borderRight: '1px solid',
    borderBottom: '1px solid',
    pointerEvents: 'initial',
    [mediaQueries.phone]: {
      margin: '0 auto',
      left: 32,
      right: 32
    }
  },
  message: {
    ...font.body1,
    whiteSpace: 'pre-wrap'
  },
  info: {
    color: colors.darkgray,
    borderColor: colors.faintgray
  },
  success: {
    color: colors.midgray,
    borderColor: colors.brandgreen
  },
  error: {
    color: colors.red,
    borderColor: colors.red
  }
})

export default Notification
