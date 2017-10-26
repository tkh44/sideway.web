import { Component, PropTypes } from 'react'
import { BubbleInput, bubbleShape } from 'bubble'

class MessageInput extends Component {
  static propTypes = {
    bubble: bubbleShape,
    profile: PropTypes.object,
    request: PropTypes.func,
    room: PropTypes.object,
    change: PropTypes.func,
    reset: PropTypes.func
  };

  render () {
    const { room, bubble, request, change } = this.props

    return (
      <BubbleInput
        room={room}
        bubble={bubble}
        request={request}
        change={change}
      />
    )
  }
}

export default MessageInput
