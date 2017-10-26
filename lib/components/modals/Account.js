import { Component } from 'react'
import { connect } from 'react-redux'
import PersonalInfoForm from 'account/PersonalInfoForm'
import InviteForm from 'account/InviteForm'
import Emails from 'account/Emails'
import Twitter from 'account/Twitter'
import Medium from 'account/Medium'
import Mobile from 'account/Mobile'
import EditAvatar from 'account/EditAvatar'
import Notifications from 'account/Notifications'
import { profileActions } from 'redux/profile'

class Account extends Component {
  componentDidMount () {
    this.subscribeProfile()
  }

  render () {
    const { profile, push, dispatch } = this.props

    return (
      <div className='account-modal-content'>
        <PersonalInfoForm dispatch={dispatch} profile={profile} />
        <EditAvatar dispatch={dispatch} profile={profile} />
        <Emails profile={profile} dispatch={dispatch} />
        <Notifications dispatch={dispatch} profile={profile} push={push} />
        <Twitter profile={profile} dispatch={dispatch} />
        <Medium profile={profile} dispatch={dispatch} />
        <Mobile profile={profile} dispatch={dispatch} />
        <InviteForm profile={profile} dispatch={dispatch} />
      </div>
    )
  }

  subscribeProfile () {
    const { dispatch } = this.props

    dispatch(profileActions.subscribeProfile())
  }
}

const mapStateToProps = state => {
  return {
    profile: state.profile,
    push: state.push
  }
}

export default connect(mapStateToProps)(Account)
