import { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Redirect from 'react-router-dom/es/Redirect'
import updateDocTitle from 'hoc/update-doc-title'
import scrollTopOnMount from 'hoc/scrollTopOnMount'
import StandardPage from 'ui/StandardPage'
import Header from 'ui/Header'
import Footer from 'ui/Footer'
import UserSubheader from 'ui/UserSubheader'
import RoomList from 'room/RoomList'
import RoomListItem from 'room/RoomListItem'
import { socialActions } from 'redux/social'
import { getSocialUserByUsername } from 'selectors/social'
import { pickRoomsFromList } from 'selectors/rooms'

class About extends Component {
  componentDidMount () {
    this.fetchUser(this.props.account)
  }

  componentDidUpdate (prevProps, prevState) {
    const prevAccount = prevProps.account
    const account = this.props.account

    if (prevAccount !== account) {
      this.fetchUser(account)
    }
  }

  render () {
    const { user, rooms, profile } = this.props
    const { fetching, status } = user.$$meta

    if (!fetching && status !== 200) {
      return <Redirect to={status === 404 ? '/404' : '/500'} />
    }

    return (
      <StandardPage header={Header} footer={Footer}>
        <UserSubheader user={user} showUsername={false} />
        <RoomList
          emptyMessage={
            fetching
              ? ''
              : `${user.display} is not a particpant in any conversations`
          }
          excludeUserId={user.id}
          itemComponent={RoomListItem}
          profile={profile}
          rooms={rooms}
        />
      </StandardPage>
    )
  }

  fetchUser (accountToFetch) {
    const { dispatch } = this.props
    dispatch(socialActions.about(accountToFetch, 'username', false))
  }
}

const mapStateToProps = (state, props) => {
  const userAccount = props.match.params.account
  const storedUser = getSocialUserByUsername(state, userAccount) || {
    $$meta: { fetching: true, ok: null },
    username: userAccount,
    list: []
  }

  return {
    account: userAccount,
    profile: state.profile || {},
    user: storedUser,
    rooms: pickRoomsFromList(storedUser.list, state.rooms)
  }
}

export default compose(
  connect(mapStateToProps),
  updateDocTitle(props => props.user.display),
  scrollTopOnMount
)(About)
