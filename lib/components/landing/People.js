import { Component, PropTypes } from 'react'

class People extends Component {
  static propTypes = {
    className: PropTypes.string,
    delay: PropTypes.number,
    duration: PropTypes.number,
    onAnimationEnd: PropTypes.func,
    stopAnimation: PropTypes.bool,
    startOpacity: PropTypes.number,
    xDelta: PropTypes.number,
    yDelta: PropTypes.number
  };

  constructor (props) {
    super(props)

    this.state = {
      opacity: props.startOpacity,
      transform: 'translate3d(0,0,0)',
      transition: `opacity 2000ms ease-in, transform ${this.props.duration}ms linear`
    }

    this.animateStartTimeout = null
    this.startAnimation = this.startAnimation.bind(this)
    this.onAnimationEnd = this.onAnimationEnd.bind(this)
  }

  componentDidMount () {
    this.animateStartTimeout = setTimeout(
      this.startAnimation,
      this.props.delay
    )
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.stopAnimation === true) {
      this.setState({ opacity: 0 })
      this.cleanup()
    }
  }

  componentWillUnmount () {
    this.cleanup()
  }

  render () {
    return (
      <div
        className={this.props.className}
        style={{
          transition: this.state.transition,
          transform: this.state.transform,
          opacity: this.state.opacity
        }}
        onTransitionEnd={this.onAnimationEnd}
      />
    )
  }

  onAnimationEnd (e) {
    if (e.propertyName === 'opacity') {
      return
    }

    window.requestAnimationFrame(() => {
      this.setState({ opacity: 0 })
      this.props.onAnimationEnd && this.props.onAnimationEnd()
    })
  }

  startAnimation () {
    window.requestAnimationFrame(() => {
      this.setState({
        opacity: 1,
        transform: `translate3d(${this.props.xDelta}px, ${this.props.yDelta}px, 0)`
      })
    })
  }

  cleanup () {
    clearTimeout(this.animateStartTimeout)
  }
}

export default People
