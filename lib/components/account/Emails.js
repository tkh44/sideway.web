import ProfileSection from 'account/ProfileSection'
import AddEmailForm from 'account/AddEmailForm'
import AccountEmails from 'account/AccountEmails'

const Emails = ({ profile, dispatch }) => {
  return (
    <ProfileSection title='Email' showTopBorder>
      <AccountEmails profile={profile} dispatch={dispatch} />
      <AddEmailForm profile={profile} dispatch={dispatch} />
    </ProfileSection>
  )
}

export default Emails
