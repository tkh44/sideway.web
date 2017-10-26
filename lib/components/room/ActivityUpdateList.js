import { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import defaultProps from 'recompose/defaultProps'
import AcitivityUpdate from 'room/ActivityUpdate'
import { getRoomById } from 'selectors/rooms'
import * as domUtils from 'utils/dom'

const hasText = activity => activity && (activity.preview || activity.pending)

const getActiveActivities = (activity = {}) => {
  return Object.keys(activity).filter(a => hasText(activity[a]))
}

const sortActivities = (activity = {}) => {
  return getActiveActivities(activity).sort((a, b) => {
    return activity[a].ts - activity[b].ts
  })
}

const orderActivities = (
  currentActivity = {},
  nextActivity = {},
  currentOrder = []
) => {
  const out = [...currentOrder]
  Object.keys(currentActivity).forEach(key => {
    const outIndex = out.indexOf(key)
    if (
      hasText(currentActivity[key]) &&
      !hasText(nextActivity[key]) &&
      outIndex > -1
    ) {
      out.splice(outIndex, 1)
    }
  })

  sortActivities(nextActivity).forEach(key => {
    const outIndex = out.indexOf(key)
    if (
      hasText(nextActivity[key]) &&
      !hasText(currentActivity[key]) &&
      outIndex === -1
    ) {
      out.push(key)
    }
  })

  return out
}

const makeMapStateToProps = (initialState, initialProps) => {
  const roomId = initialProps.roomId

  return state => {
    const room = getRoomById(state, roomId)
    return {
      activity: room.activity,
      participants: room.participants,
      roomActive: room.status === 'active'
    }
  }
}

export default compose(
  defaultProps({
    activity: {},
    paricipants: {}
  }),
  connect(makeMapStateToProps)
)(
  class extends Component {
    constructor (props) {
      super(props)
      this.state = {
        order: orderActivities({}, this.props.activity, [])
      }
    }

    componentWillReceiveProps (nextProps) {
      if (this.props.activity !== nextProps.activity) {
        this.setState({
          order: orderActivities(
            this.props.activity,
            nextProps.activity,
            this.state.order
          )
        })
      }
    }

    componentWillUpdate (nextProps, nextState) {
      if (nextProps.roomActive && nextProps.activity !== this.props.activity) {
        this.scrollToBottom = domUtils.isScrolledToBottom(10)
      }
    }

    componentDidUpdate (prevProps, prevState) {
      if (this.scrollToBottom) {
        domUtils.scrollToBottom()
        this.scrollToBottom = false
      }
    }

    render () {
      const { order } = this.state
      const {
        activity,
        participants,
        roomActive,
        roomId
      } = this.props

      return (
        <div>
          {order.map(id => {
            const key = `user-activity--${id}`
            return (
              <AcitivityUpdate
                key={key}
                user={participants[id]}
                activity={activity[id]}
                roomActive={roomActive}
                roomId={roomId}
              />
            )
          })}
        </div>
      )
    }
  }
)
