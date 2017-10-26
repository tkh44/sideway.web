import { Component, DOM as R } from 'react'
import { Motion, spring } from 'react-motion'
import { configw } from 'utils/func'

const [stiffness, damping] = configw(60, 0.2)
const SPRING_CONFIG = { stiffness, damping, precision: 0.1 }
const ROTATION_SPRING = {
  stiffness: stiffness * 3,
  damping: damping * 3,
  precision: 0.1
}
const RISE_SPRING = {
  stiffness: stiffness * 35,
  damping: damping * 10,
  precision: 0.1
}

class Balloon extends Component {
  render () {
    const { balloonState, ratio, onBalloonRest, winDem } = this.props

    return (
      <Motion
        style={this.balloonMotionForState(balloonState, ratio, winDem)}
        onRest={onBalloonRest}
      >
        {currentStyles => {
          const x = currentStyles.translateX
          const y = currentStyles.translateY
          let opacity = 1
          let display = 'block'

          if (balloonState === 0 || balloonState === 3) {
            opacity = 0
            display = 'block'
          }

          return R.React.createElement('div', {
            ref: el => {
              this.balloonEl = el
            },
            className: 'balloon',
            style: {
              transform: `translate3d(${x}px, ${y}px, 0) rotate(${currentStyles.rotateZ}deg)`,
              right: currentStyles.right,
              bottom: currentStyles.bottom,
              width: 160 * ratio,
              height: 160 * ratio,
              opacity,
              display
            }
          })
        }}
      </Motion>
    )
  }

  balloonMotionForState = (balloonState, ratio, winDem) => {
    const height = 160 * ratio
    const horizon = Math.min(winDem.height / 2, 680)
    const start = horizon + height * 0.60
    const styleStates = [
      {
        translateY: start / 2 + 0.15 * horizon,
        translateX: 0,
        rotateZ: 0,
        bottom: start,
        right: 160 * ratio
      },
      {
        translateY: spring(0.15 * horizon, RISE_SPRING),
        translateX: 0,
        rotateZ: 0,
        bottom: start,
        right: 160 * ratio
      },
      {
        translateY: spring(-0.2 * horizon, SPRING_CONFIG),
        translateX: spring(-winDem.width, SPRING_CONFIG),
        rotateZ: spring(-12, ROTATION_SPRING),
        bottom: start,
        right: 160 * ratio
      },
      {
        translateY: -0.30 * horizon,
        translateX: -winDem.width,
        rotateZ: spring(-12, ROTATION_SPRING),
        bottom: start,
        right: 160 * ratio
      }
    ]

    const styleState = styleStates[balloonState]
    return styleState
  };
}

export default Balloon
