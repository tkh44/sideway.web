import { Component } from 'react'
import { connect } from 'react-redux'
import { css, StyleSheet } from 'aphrodite/no-important'
import { breakpoints, colors, font } from 'style'
import RoomHeader from 'room/RoomHeader'
import AnimatedBird from 'art/AnimatedBird'
import { getRoomById, isLoaded } from 'selectors/rooms'

export default function roomLoadingWrapper (WrappedComponent) {
  class RoomLoadingWrapper extends Component {
    constructor (props) {
      super(props)

      this.state = {
        loading: true,
        loaded: props.roomLoaded,
        pastDelay: false
      }

      this.loadingFlipTimeout = null
    }

    componentWillMount () {
      this.loadingFlipTimeout = setTimeout(
        () => {
          this.setState({ pastDelay: true })
        },
        250
      )
    }

    componentWillUnmount () {
      clearTimeout(this.loadingFlipTimeout)
    }

    render () {
      const { pastDelay } = this.state
      const {
        location,
        roomLoaded,
        roomId,
        roomUI
      } = this.props

      if (!roomLoaded) {
        return (
          <div key='loading-room' className={css(styles.loadingRoomContent)}>
            <RoomHeader
              className={css(styles.loadingRoomHeader)}
              loading
              location={location}
              roomId={roomId}
              roomUI={roomUI}
            />
            {pastDelay &&
              <div className={css(styles.loadingContainer)}>
                <AnimatedBird className={css(styles.animatedBird)} />
                <p>
                  Loading Conversation
                </p>
              </div>}
          </div>
        )
      }

      return <WrappedComponent key='room' {...this.props} />
    }
  }

  const makeMapStateToProps = (initialState, initialProps) => {
    const roomId = initialProps.roomId

    return state => {
      return {
        roomLoaded: isLoaded(getRoomById(state, roomId)),
        roomUI: state.roomUI[roomId]
      }
    }
  }

  return connect(makeMapStateToProps)(RoomLoadingWrapper)
}

const styles = StyleSheet.create({
  loadingRoomContent: {
    marginTop: 160,
    paddingBottom: 16
  },
  loadingRoomHeader: {
    // ...commonStyles.drawnBorder(false, false, true, false, colors.faintgray)
  },
  loadingContainer: {
    ...font.title,
    position: 'relative',
    margin: '0 auto',
    maxWidth: breakpoints.tablet,
    color: colors.lightgray,
    textAlign: 'center'
  },
  animatedBird: {
    display: 'block',
    marginTop: 16,
    marginRight: 'auto',
    marginBottom: 16,
    marginLeft: 'auto'
  }
})
