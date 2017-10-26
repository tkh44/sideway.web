import { PureComponent } from 'react'
import MessageText from 'room/MessageText'
import TranscriptEntryMeta from 'room/TranscriptEntryMeta'
import { breakpoints, colors } from 'style'

export default class ScaledMessagePreview extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      width: props.maxWidth,
      height: props.maxHeight,
      scaledContentHeight: props.maxHeight,
      scaledContentWidth: props.maxWidth,
      scale: 1
    }
  }

  componentDidMount () {
    if (this.props.message && this.props.message.id) {
      this.scalePreview(this.props)
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.message.id !== prevProps.message.id) {
      this.scalePreview(this.props)
    }
  }

  render () {
    const {
      width,
      height,
      scale,
      scaledContentHeight,
      scaledContentWidth
    } = this.state
    const { message, x, y } = this.props
    const buffer = 16
    const top = y - scaledContentHeight - buffer
    const left = x - scaledContentWidth / 2

    if (!(message && message.id)) {
      return null
    }

    return (
      <div
        ref={node => {
          this.wrapper = node
        }}
        style={{
          top: top,
          left: left,
          position: 'fixed',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            width,
            height,
            maxWidth: '100%',
            overflow: 'hidden',
            pointerEvents: 'none'
          }}
        >
          <div
            ref={node => {
              this.content = node
            }}
            style={{
              minWidth: breakpoints.phone,
              transform: `scale(${scale})`,
              transformOrigin: 'bottom',
              background: colors.white,
              border: `1px solid ${colors.faintgray}`,
              paddingTop: 8,
              paddingRight: 8,
              paddingBottom: 8,
              paddingLeft: 8,
              pointerEvents: 'initial'
            }}
          >
            <TranscriptEntryMeta
              key={message.id}
              blogMode={false}
              user={message.user}
            />
            <MessageText message={message} />
          </div>
        </div>
      </div>
    )
  }

  scalePreview (props) {
    const wrapperWidth = this.wrapper.offsetWidth
    const contentHeight = this.content.offsetHeight
    const contentWidth = this.content.offsetWidth

    const scale = Math.min(
      wrapperWidth / contentWidth,
      props.maxHeight / contentHeight,
      props.maxWidth / contentWidth
    )

    this.setState({
      scale,
      scaledContentHeight: scale * contentHeight,
      scaledContentWidth: scale * contentWidth
    })
  }
}
