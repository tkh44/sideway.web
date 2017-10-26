import { Component } from 'react'
import { connect } from 'react-redux'
import { colors } from 'style'

const mapStateToProps = state => {
  const { connected, connecting, disconnect } = state.nes
  return { connected, connecting, disconnect }
}

export default connect(mapStateToProps)(
  class extends Component {
    static defaultProps = {
      connectedColor: colors.brandgreen,
      connectedText: 'Connected!',
      connectingColor: colors.brandgreen,
      connectingText: 'Connecting…',
      disconnectedColor: colors.red,
      disconnectedText: 'We are having trouble connecting. Just a sec.'
    };

    constructor (props) {
      super(props)
      this.state = { showStatus: props.disconnect }
      this.stateChangeTimeout = null
    }

    componentWillReceiveProps (nextProps) {
      // This could be simplified *I think* I couldn't get consistent results by merging to the two
      if (!this.props.disconnect && nextProps.disconnect) {
        clearTimeout(this.stateChangeTimeout)
        this.stateChangeTimeout = setTimeout(
          () => {
            this.setState({ showStatus: true })
            this.stateChangeTimeout = null
          },
          2000
        )
      }

      if (this.props.disconnect && !nextProps.disconnect) {
        clearTimeout(this.stateChangeTimeout)
        this.stateChangeTimeout = setTimeout(
          () => {
            this.setState({ showStatus: false })
            this.stateChangeTimeout = null
          },
          1000
        )
      }
    }

    componentWillUnmount () {
      clearTimeout(this.stateChangeTimeout)
    }

    render () {
      const { showStatus } = this.state
      const {
        className,
        connected,
        connectedColor,
        connectedText,
        connecting,
        connectingColor,
        connectingText,
        disconnectedColor,
        disconnectedText,
        messageClassName,
        messageStyle,
        style
      } = this.props

      let color = colors.white

      if (connected) {
        color = connectedColor
      } else if (connecting) {
        color = connectingColor
      } else if (!connected) {
        color = disconnectedColor
      }

      return showStatus &&
        <div
          className={className}
          style={{
            color,
            border: '2px solid currentColor',
            backgroundColor: colors.white,
            ...style
          }}
        >
          <div className={messageClassName} style={messageStyle}>
            {connecting && connectingText}
            {!connected && disconnectedText}
            {connected && connectedText}
          </div>
        </div>
    }
  }
)
