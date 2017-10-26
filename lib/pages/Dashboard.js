import { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import scrollTopOnMount from 'hoc/scrollTopOnMount'
import StandardPage from 'ui/StandardPage'
import Header from 'ui/Header'
import Footer from 'ui/Footer'
import DashboardHeader from 'dashboard/DashboardHeader'
import RoomList from 'room/RoomList'
import RoomListItem from 'room/RoomListItem'
import { roomActions } from 'redux/rooms'
import { authInProgress, isLoggedIn } from 'selectors/auth'
import { pickRoomsFromList } from 'selectors/rooms'

class Dashboard extends Component {
  componentDidMount () {
    this.loadRooms(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.loggedIn && nextProps.loggedIn) {
      this.loadRooms(nextProps)
    }
  }

  render () {
    const { fetching, loggedIn, profile, rooms, style } = this.props

    return (
      <StandardPage
        header={Header}
        footer={Footer}
        contentMarginTop={90}
        style={style}
      >
        {loggedIn &&
          <RoomList
            emptyMessage={fetching ? '' : "You don't have any conversations"}
            itemComponent={RoomListItem}
            excludeUserId={profile.id}
            rooms={rooms}
          />}
      </StandardPage>
    )
  }

  loadRooms ({ dispatch, loggedIn }) {
    if (!loggedIn) {
      return
    }

    dispatch(roomActions.getRoomList())
  }
}

const mapStateToProps = state => {
  const profile = state.profile
  const profileRooms = profile.rooms || { $$meta: { fetching: true }, ids: [] }
  return {
    authActive: authInProgress(state),
    loggedIn: isLoggedIn(state),
    profile,
    rooms: pickRoomsFromList(profileRooms.ids, state.rooms),
    fetching: profileRooms.$$meta.fetching && !profileRooms.ids.length
  }
}

export default compose(connect(mapStateToProps), scrollTopOnMount)(Dashboard)
