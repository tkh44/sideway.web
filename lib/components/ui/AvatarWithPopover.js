import { Component } from 'react'
import Avatar from 'ui/Avatar'
import UserCardTooltip from 'ui/UserCardTooltip'
import Popover from 'ui/Popover'

class AvatarWithPopover extends Component {
  render () {
    const { className, size, style, user, ...passable } = this.props

    return (
      <Popover
        className={className}
        style={style}
        component='div'
        popoverComponent={UserCardTooltip}
        popoverProps={{ user }}
      >
        <Avatar size={size} user={user} {...passable} />
      </Popover>
    )
  }
}

export default AvatarWithPopover
