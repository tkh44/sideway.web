import { Component, DOM } from 'react'
import { connect } from 'react-redux'
import { hawkNow } from 'utils/hawk'
import { getRoomById } from 'selectors/rooms'

// This component renders nothing
class CountDown extends Component {
  constructor (props) {
    super(props)

    this.tickInterval = null
    this.onCompleteCbCalled = false
  }

  componentDidMount () {
    this.startTimer(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (!this.tickInterval && !this.onCompleteCbCalled) {
      this.startTimer(nextProps)
    }
  }

  componentWillUnmount () {
    clearInterval(this.tickInterval)
  }

  render () {
    return DOM.noscript()
  }

  startTimer (props) {
    const { timestamp } = this.props

    if (!timestamp || isNaN(timestamp)) {
      return
    }

    this.tickInterval = setInterval(
      () => {
        this.tick()
      },
      props.interval || 1000
    )
  }

  tick () {
    const diff = this.props.timestamp - hawkNow()

    if (!this.onCompleteCbCalled && diff <= 0) {
      clearInterval(this.tickInterval)
      this.tickInterval = null
      this.props.onComplete && this.props.onComplete()
    }
  }
}

const makeMapStateToProps = (initialState, initialProps) => {
  const roomId = initialProps.roomId

  return state => {
    const room = getRoomById(state, roomId)
    const { limits: { idle }, system: { last: lastActivity } } = room

    return {
      timestamp: idle + lastActivity
    }
  }
}

export default connect(makeMapStateToProps)(CountDown)
