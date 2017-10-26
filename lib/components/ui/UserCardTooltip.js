import { Component } from 'react'
import ProfileCard from 'ui/ProfileCard'
import CardTooltip from 'ui/CardTooltip'

// Note the the "anchor" component must initiate the fetch for user data
class UserCardTooltip extends Component {
  render () {
    const { user, ...passable } = this.props

    return (
      <CardTooltip.Popover {...passable} className='user-card-tooltip'>
        <ProfileCard user={user} />
      </CardTooltip.Popover>
    )
  }
}

export default UserCardTooltip
