import { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import withRouter from 'react-router-dom/es/withRouter'
import { sitrep } from 'redux/sitrep'
import { getRoomAccessRights, getRoomById } from 'selectors/rooms'

const roomDoor = WrappedComponent => {
  class RoomDoor extends Component {
    componentDidMount () {
      this.checkRoomAccess(this.props)
    }

    componentWillReceiveProps (nextProps) {
      this.checkRoomAccess(nextProps)
    }

    render () {
      return <WrappedComponent {...this.props} />
    }

    checkRoomAccess (nextProps) {
      if (nextProps.roomAccess === 'none') {
        this.redirect()
        this.displayMessage()
      }
    }

    redirect () {
      const { history: { push } } = this.props
      push('/')
    }

    displayMessage () {
      const { dispatch } = this.props

      dispatch(
        sitrep.notify({
          message: 'Conversation is no longer available.',
          duration: 4000
        })
      )
    }
  }

  const makeMapStateToProps = (initialState, initialProps) => {
    const roomId = initialProps.roomId

    return state => {
      const accessRights = getRoomAccessRights(getRoomById(state, roomId), state.profile.id)

      return {
        roomAccess: accessRights.access
      }
    }
  }

  return compose(connect(makeMapStateToProps), withRouter)(RoomDoor)
}

export default roomDoor
