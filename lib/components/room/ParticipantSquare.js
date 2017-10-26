import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import Avatar from 'ui/Avatar'
import Popover from 'ui/Popover'
import UserCardTooltip from 'ui/UserCardTooltip'

class ParticipantSquare extends Component {
  render () {
    const {
      style,
      user,
      roomCompleted,
      avatarSize = 'medium',
      disableFade = false
    } = this.props

    return (
      <Popover
        className={css(styles.participantSquare)}
        style={style}
        component='div'
        popoverComponent={UserCardTooltip}
        popoverProps={{ user }}
      >
        <Avatar
          user={user}
          size={avatarSize}
          fade={disableFade ? false : roomCompleted || user.disabled}
          present={user.present}
        />
      </Popover>
    )
  }
}
const styles = StyleSheet.create({
  participantSquare: {
    position: 'relative',
    marginRight: 4
  }
})

export default ParticipantSquare
