import { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import withPropsOnChange from 'recompose/withPropsOnChange'
import Measure from 'react-measure'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, commonStyles, font } from 'style'
import PendingComment from 'room/PendingComment'
import Icon from 'art/Icon'
import {
  getPendingComments,
  getRoomAccessRights,
  getRoomById
} from 'selectors/rooms'

const mapStateToProps = (initialState, initialProps) => {
  const roomId = initialProps.roomId

  return state => {
    const room = getRoomById(state, roomId)
    const profile = state.profile
    const accessRights = getRoomAccessRights(room, profile.id)

    return {
      canWrite: accessRights.canWrite,
      pending: room.pending,
      profile,
      roomActive: room.status === 'active',
      roomPending: room.status === 'pending',
      roomTitle: room.title
    }
  }
}

export default compose(
  connect(mapStateToProps),
  withPropsOnChange(['pending', 'canWrite', 'profile'], ({
    pending,
    canWrite,
    profile
  }) => {
    return {
      pendingComments: getPendingComments(pending, canWrite, profile.id)
    }
  })
)(
  class PendingCommentList extends Component {
    constructor (props) {
      super(props)
      this.state = { contentHeight: null }
      this.closeAnimationId = null
    }

    componentDidUpdate (prevProps, prevState) {
      if (
        prevProps.pendingComments.length && !this.props.pendingComments.length
      ) {
        this.closeAnimationId = window.requestAnimationFrame(() => {
          this.props.onClose()
        })
      }
    }

    componentWillUnmount () {
      if (this.closeAnimationId) {
        window.cancelAnimationFrame(this.closeAnimationId)
      }
    }

    render () {
      const {
        canWrite,
        headerHeight,
        onClose,
        pendingComments,
        profile,
        roomActive,
        roomId,
        roomPending,
        style,
        top
      } = this.props

      return (
        <div
          className={css(styles.pendingComments)}
          style={style}
          tabIndex={-1}
        >
          <div className={css(styles.header)}>
            <div className={css(styles.title)}>
              Pending Comments
            </div>
            <Icon
              name='close'
              className={css(styles.closeIcon)}
              style={{
                width: 32,
                height: 32
              }}
              onClick={onClose}
            />
          </div>
          <div
            ref={node => {
              this.scrollEl = node
            }}
            className={css(styles.scrollContainer)}
            style={{
              maxHeight: top - (headerHeight + 32),
              height: this.state.contentHeight || 'auto'
            }}
          >
            <Measure
              whiteList={['height']}
              accurate
              onMeasure={this.handleMeasure}
            >
              <div className={css(styles.commentsWrapper)}>
                {pendingComments.map(comment => {
                  return (
                    <PendingComment
                      key={comment.id}
                      comment={comment}
                      canWrite={canWrite}
                      onApprove={onClose}
                      profileId={profile.id}
                      roomActive={roomActive}
                      roomId={roomId}
                      roomPending={roomPending}
                      // for userLoader
                      userAccount={comment.user}
                    />
                  )
                })}
                {!pendingComments.length &&
                  <div className={css(styles.noPendingComments)}>
                    <div>
                      There are no pending comments
                    </div>
                  </div>}
              </div>
            </Measure>
          </div>
        </div>
      )
    }

    handleMeasure = ({ height }) => this.setState({ contentHeight: height });

    // handleWheel = (e) => {
    //   const scrollTop = this.scrollEl.scrollTop
    //   const deltaY = e.nativeEvent.deltaY
    //
    //   if (this.scrollEl.scrollHeight === this.scrollEl.clientHeight) {  // disable if the div is not scrollable
    //     return
    //   }
    //
    //   if (deltaY <= 0) {  // scrolling up
    //     if (scrollTop === 0) {
    //       e.preventDefault()
    //     }
    //   } else {
    //     if (scrollTop + this.scrollEl.clientHeight >= this.scrollEl.scrollHeight) {
    //       e.preventDefault()
    //     }
    //   }
    // }
  }
)

const styles = StyleSheet.create({
  pendingComments: {
    ...commonStyles.drawnBorder(true, true, false, true, colors.lightgray),
    position: 'relative',
    flex: 1,
    // diplay: 'flex',
    width: '100%',
    paddingTop: 16,
    paddingRight: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    backgroundColor: colors.white,
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    height: 40,
    paddingBottom: 8
  },
  title: {
    ...font.title,
    flex: 1
  },
  closeIcon: {
    flex: 'none',
    marginLeft: 'auto',
    fill: colors.darkgray,
    cursor: 'pointer',
    ':hover': {
      fill: colors.brandgreen
    }
  },
  scrollContainer: {
    ...commonStyles.scrollable
  },
  noPendingComments: {
    ...font.display1,
    color: colors.lightgray,
    paddingTop: 16,
    paddingBottom: 16
  }
})
