import { Component, DOM } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors } from 'style'
import Icon from 'art/Icon'
import { makeRoomCalEvent } from 'utils/file'

export default class AddRoomToCalendar extends Component {
  state = {
    fileUrl: ''
  };

  componentWillUnmount () {
    if (this.state.fileUrl) {
      window.URL.revokeObjectURL(this.state.fileUrl)
    }
  }

  render () {
    const { fileUrl } = this.state
    const { room, style } = this.props

    if (!room.time || room.status !== 'pending') {
      return DOM.noscript()
    }

    return (
      <a
        ref={node => {
          this.el = node
        }}
        className={css(styles.button)}
        href={fileUrl}
        download={`${room.title}.ics`}
        style={style}
        onClick={this.handleClick}
        label='Add room to calendar'
      >
        <Icon
          name='calendar'
          className={css(styles.icon)}
          style={{
            height: 36,
            width: 36
          }}
        />
      </a>
    )
  }

  handleClick = e => {
    const { room } = this.props
    if (this.state.fileUrl) {
      window.URL.revokeObjectURL(this.state.fileUrl)
    }

    const url = window.URL.createObjectURL(makeRoomCalEvent(room))
    this.setState({ fileUrl: url })
  };
}

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    flex: 'none'
  },
  icon: {
    fill: colors.lightgray,
    ':hover': {
      fill: colors.brandgreen
    }
  }
})
