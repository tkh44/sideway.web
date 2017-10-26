import { Component } from 'react'
import { connect } from 'react-redux'
import { css, StyleSheet } from 'aphrodite/no-important'
import { breakpoints, mediaQueries } from 'style'
import { spring, TransitionMotion } from 'react-motion'
import Notification from './Notification'
import { sitrep as sitrepActions } from 'redux/sitrep'

const SITREP_SPRING = { stiffness: 360, damping: 25 }

class Sitrep extends Component {
  render () {
    const { headerHeight = 64, dismiss } = this.props

    return (
      <TransitionMotion
        willEnter={this.willEnter}
        willLeave={this.willLeave}
        styles={this.getStyles}
      >
        {currentStyles => {
          return (
            <div
              className={css(styles.sitrep)}
              style={{
                top: headerHeight
              }}
            >
              {currentStyles.map(({ key, data, style }) => {
                return (
                  <Notification
                    key={key}
                    dismiss={dismiss}
                    style={{
                      transform: `scale3d(${style.scale}, ${style.scale}, ${style.scale})`,
                      opacity: style.opacity
                    }}
                    {...data}
                  />
                )
              })}
            </div>
          )
        }}
      </TransitionMotion>
    )
  }

  willEnter = () => {
    return {
      scale: 0.75,
      opacity: 0.5
    }
  };

  willLeave = () => {
    return {
      scale: spring(0.8, SITREP_SPRING),
      opacity: spring(0, SITREP_SPRING)
    }
  };

  getStyles = () => {
    const { sitrep } = this.props
    const sortedKeys = Object.keys(sitrep).sort(
      (a, b) => parseInt(a.key, 10) - parseInt(b.key, 10)
    )

    return sortedKeys.map(key => {
      return {
        key,
        data: sitrep[key],
        style: {
          scale: spring(1, SITREP_SPRING),
          opacity: spring(1, SITREP_SPRING)
        }
      }
    })
  };
}

const styles = StyleSheet.create({
  sitrep: {
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    left: 16,
    right: 16,
    width: 'calc(100% - 32px)',
    maxWidth: breakpoints.tablet,
    pointerEvents: 'none',
    zIndex: 9,
    cursor: 'pointer',
    [mediaQueries.phone]: {
      margin: '0 auto',
      left: 32,
      right: 32,
      width: 'calc(100% - 64px)'
    }
  }
})

const mapStateToProps = state => {
  return {
    sitrep: state.sitrep
  }
}

export default connect(mapStateToProps, sitrepActions)(Sitrep)
