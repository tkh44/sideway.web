import { Component, PropTypes } from 'react'
import { Motion, spring } from 'react-motion'
import listen from 'simple-listen'
import { clamp } from 'utils/func'

const SCALE_FACTOR = 1.025

class FloatingBalloon extends Component {
  static propTypes = {
    loaded: PropTypes.any,
    children: PropTypes.node,
    message: PropTypes.string,
    target: PropTypes.string
  };

  static defaultProps = {
    loaded: false,
    message: '',
    showMessage: true
  };

  constructor (props) {
    super(props)

    this.state = {
      initialX: window.innerWidth / 2 - 64,
      initialY: window.innerHeight / 2 - 64,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      height: 0,
      width: 0,
      xDirection: 0,
      pressed: false
    }

    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.handleTouchMove = this.handleTouchMove.bind(this)
    this.handleResize = this.handleResize.bind(this)
  }

  componentDidMount () {
    this.mouseMoveListener = listen(window, 'mousemove', this.handleMouseMove)
    this.touchMoveListener = listen(window, 'touchmove', this.handleTouchMove)
    this.mouseUpListener = listen(document, 'mouseup', this.handleMouseUp)
    this.touchEndListener = listen(document, 'touchend', this.handleMouseUp)
    this.resizeListener = listen(window, 'resize', this.handleResize)
    this.handleResize()
  }

  componentWillUnmount () {
    this.mouseMoveListener()
    this.touchMoveListener()
    this.mouseUpListener()
    this.touchEndListener()
    this.resizeListener()
  }

  render () {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        <Motion style={this.getStyles()}>
          {current => {
            const scale = SCALE_FACTOR *
              (1 + (current.y - this.state.initialY) / this.state.winHeight)

            return (
              <div
                ref={el => {
                  this.animEl = el
                }}
                className='balloon-animated-wrapper'
                onMouseUp={this.handleMouseUp}
                onTouchEnd={this.handleMouseUp}
                onMouseDown={this.handleMouseDown}
                onTouchStart={this.handleMouseDown}
                style={{
                  opacity: this.props.modalOpacity,
                  transformOrigin: 'center center',
                  transform: `scale(${scale}) rotateZ(${current.r}deg)`,
                  top: current.y,
                  left: current.x
                }}
              >
                <div
                  className='balloon'
                  style={{
                    transform: `rotateZ(${current.r}deg) `
                  }}
                  ref={node => {
                    this.balloon = node
                  }}
                />
              </div>
            )
          }}
        </Motion>
      </div>
    )
  }

  handleMouseMove ({ pageX: x, pageY: y }) {
    const xDirection = x === this.state.x || Math.abs(x - this.state.x) < 10
      ? 0
      : this.state.x > x ? 1 : -1

    this.setState({ x, y, xDirection })
  }

  handleMouseDown () {
    this.setState({ pressed: true })
  }

  handleMouseUp () {
    this.setState({ pressed: false })
  }

  handleTouchMove (e) {
    this.handleMouseMove(e.touches[0])
  }

  handleResize () {
    const { top, left, width, height } = this.animEl.getBoundingClientRect()
    const { innerHeight: winHeight, innerWidth: winWidth } = window

    this.setState({
      top,
      left,
      width,
      height,
      winHeight,
      winWidth,
      initialX: winWidth / 2 - width / 2,
      initialY: winHeight / 2 - height
    })
  }

  relativeX (x) {
    return x - (this.state.left + this.state.width / 2)
  }

  relativeY (y) {
    return y - (this.state.top + this.state.height / 2)
  }

  getStyles () {
    const {
      x: currentX,
      y: currentY,
      initialX,
      initialY,
      xDirection,
      pressed,
      winHeight,
      winWidth,
      height,
      width
    } = this.state

    const x = pressed ? clamp(currentX, 0, winWidth - width * 1.5) : initialX
    const y = pressed ? clamp(currentY, 0, winHeight - height * 1.5) : initialY
    const r = pressed ? xDirection * 14 : 0

    return {
      x: spring(x, { stiffness: 15, damping: 5 }),
      y: spring(y, { stiffness: 15, damping: 5 }),
      r: spring(r, { stiffness: 15, damping: 5 })
    }
  }
}

export default FloatingBalloon
