import { Component } from 'react'
import { get } from 'lodash'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import withRouter from 'react-router-dom/es/withRouter'
import { sitrep } from 'redux/sitrep'
import { actions as nesActions } from 'redux/nes'
import { roomActions, SUB_UPDATE } from 'redux/rooms'
import { getRoomById } from 'selectors/rooms'
import { isLoggedIn } from 'selectors/auth'

const loadRoom = ({ redirectOnError = true }) =>
  WrappedComponent => {
    class LoadRoomById extends Component {
      constructor (props) {
        super(props)
        this.getRoomBackupTimeout = null
      }

      componentDidMount () {
        this.subscribe()
      }

      componentWillReceiveProps (nextProps) {
        if (this.props.loggedIn && this.props.loggedIn !== nextProps.loggedIn) {
          this.subscribe()
        }
      }

      componentWillUnmount () {
        const { dispatch, roomId } = this.props
        dispatch(nesActions.unsubscribe(`/room/${roomId}`))
        clearTimeout(this.getRoomBackupTimeout)
      }

      render () {
        return (
          <WrappedComponent
            {...this.props}
            roomId={this.props.roomId}
            selectedMessageId={this.props.match.params.selectedMessageId}
          />
        )
      }

      subscribe = () => {
        const { dispatch, roomId } = this.props

        this.getRoomBackupTimeout = setTimeout(
          () => {
            this.getRoom()
          },
          1000
        )

        dispatch(
          nesActions.subscribe(`/room/${roomId}`, SUB_UPDATE, subErr => {
            if (subErr) {
              if (subErr.statusCode) {
                return this.requestErrorHandler(
                  subErr.statusCode,
                  get(subErr, 'data.message')
                )
              }

              if (subErr.type === 'disconnect') {
                this.subscribe()
              }
            }

            clearTimeout(this.getRoomBackupTimeout)
            this.getRoom()
          })
        )
      };

      getRoom = () => {
        const { dispatch, roomId } = this.props
        dispatch(roomActions.getRoomById(roomId)).then(res => {
          if (!res.ok) {
            this.requestErrorHandler(res.status, get(res, 'data.message'))
          }
        })
      };

      requestErrorHandler = (status, errMessage) => {
        const {
          dispatch,
          location,
          loggedIn,
          roomPartiallyLoaded
        } = this.props

        if (status === 0 && roomPartiallyLoaded) {
          return // need a way to communicate this visually. the room has some data but can't finish loading
        }

        if (status === 403) {
          const isPrivateRoom = errMessage === 'Private room'

          if (isPrivateRoom) {
            let message
            if (isPrivateRoom) {
              message = 'The conversation is private'
            } else {
              message = 'The conversation is no longer available'
            }

            dispatch(sitrep.notify({ message }))

            if (!loggedIn) {
              dispatch({
                type: 'modal/SHOW',
                payload: {
                  modal: 'login',
                  data: { nextState: location.pathname }
                }
              })
            }

            this.redirectToErrorPage('/')

            return
          }

          return dispatch({
            type: 'modal/SHOW',
            payload: { modal: 'login', data: { nextState: location.pathname } }
          })
        }

        if (status === 404) {
          return redirectOnError ? this.redirectToErrorPage('/404') : null
        }

        if (status === 503) {
          if (
            errMessage && errMessage === 'Room reached maximum audience size'
          ) {
            dispatch(
              sitrep.notify({
                message: 'Conversation has reached the maximum audience size.'
              })
            )
          }

          return this.redirectToErrorPage('/')
        }

        this.redirectToErrorPage('/error')
      };

      redirectToErrorPage (route) {
        if (redirectOnError) {
          this.props.history.push(route)
        }
      }
    }

    const makeMapStateToProps = (initialState, initialProps) => {
      const roomId = initialProps.match.params.roomId

      return state => {
        const room = getRoomById(state, roomId)

        return {
          loggedIn: isLoggedIn(state),
          roomId,
          roomPartiallyLoaded: room.id && room.title && room.owner
        }
      }
    }

    return compose(connect(makeMapStateToProps), withRouter)(LoadRoomById)
  }

export default loadRoom
