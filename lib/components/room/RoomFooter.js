import { Component } from 'react'
import { connect } from 'react-redux'
import { get } from 'lodash'
import DataTransfer from 'fbjs/lib/DataTransfer'
import compose from 'recompose/compose'
import withReducer from 'recompose/withReducer'
import withHandlers from 'recompose/withHandlers'
import lifecycle from 'recompose/lifecycle'
import Measure from 'react-measure'
import { css, StyleSheet } from 'aphrodite/no-important'
import { breakpoints, colors, mediaQueries } from 'style'
import ConnectedBubble from 'room/ConnectedBubble'
import CommentInput from 'room/CommentInput'
import PendingCommentList from 'room/PendingCommentList'
import ImageUploadButton from 'ui/ImageUploadButton'
import PendingCommentsButton from 'room/PendingCommentsButton'
import RoomTopicButton from 'room/RoomTopicButton'
import ShareRoom from 'room/ShareRoom'
import BottomPanel from 'ui/BottomPanel'
import WindowState from 'window-state'
import FileDrop from 'ui/FileDrop'
import FilePreview from 'ui/FilePreview'
import { sitrep } from 'redux/sitrep'
import { roomActions } from 'redux/rooms'
import { roomUIActions } from 'redux/room-ui'
import {
  getRoomAccessRights,
  getRoomBlogMode,
  getRoomById as selectRoomById,
  isCommentQueueFull,
  shouldShowAddComment,
  userIsActiveParticipant
} from 'selectors/rooms'

const mapStateToProps = (initialState, initialProps) => {
  const roomId = initialProps.roomId

  return state => {
    const profile = state.profile
    const room = selectRoomById(state, roomId)
    const accessRights = getRoomAccessRights(room, profile.id)
    const roomActive = room && room.status === 'active'
    const roomCompleted = room && room.status === 'completed'
    const showBubble = roomActive && accessRights.canWrite && profile.id
    const showAddComment = shouldShowAddComment(room, profile.id)
    const commentQueueFull = isCommentQueueFull(room)

    return {
      ...accessRights,
      commentQueueFull,
      isActiveParticpant: userIsActiveParticipant(
        profile.id,
        room.participants
      ),
      isBlog: getRoomBlogMode(room.messages),
      profile,
      roomActive,
      roomCompleted,
      showAddComment,
      showBubble
    }
  }
}

export default compose(
  connect(mapStateToProps),
  withReducer(
    'panelState',
    'updatePanels',
    (state, action) => {
      switch (action.type) {
        case 'OPEN_PREVIEW':
          return { preview: true, pending: false }
        case 'CLOSE_PREVIEW':
          return { preview: false, pending: false }
        case 'OPEN_PENDING':
          return { preview: false, pending: true }
        case 'CLOSE_PENDING':
          return { preview: false, pending: false }
        default:
          return state
      }
    },
    { preview: false, pending: false }
  ),
  withHandlers({
    handleDropAccepted: ({ dispatch, profile, roomId, showBubble }) =>
      async file => {
        if (!showBubble) {
          // only manual upload for bubble input
          return
        }

        const img = new window.Image()
        img.onload = async function () {
          const removeUpload = dispatch(roomUIActions.addUpload(roomId, { type: 'image', width: this.width, height: this.height, file }))
          const res = await dispatch(
            roomActions.uploadMessageImage(roomId, file)
          )
          removeUpload()
          if (!res.ok) {
            const { data } = res
            const message = get(data, 'message', '')

            if (
              message.includes(
                'Payload content length greater than maximum allowed'
              )
            ) {
              dispatch(sitrep.error('Max upload size is 5MB'))
            } else {
              dispatch(
                sitrep.error(
                  `There was an error uploading ${file.name && file.name.length ? file.name : 'your file'}`
                )
              )
            }
          }
        }
        img.src = URL.createObjectURL(file)
      },
    handleDropRejected: ({ dispatch }) =>
      file => {
        dispatch(
          sitrep.error('Unable to upload file.\nOnly images are supported.')
        )
      },
    openPending: ({ updatePanels }) =>
      () => updatePanels({ type: 'OPEN_PENDING' }),
    closePending: ({ updatePanels }) =>
      () => updatePanels({ type: 'CLOSE_PENDING' }),
    toggleTopicInput: ({ dispatch, roomId, roomUI }) =>
      () => {
        dispatch(
          roomUIActions.setShowTopicInput({
            roomId,
            showTopicInput: !roomUI.showTopicInput
          })
        )
      }
  }),
  lifecycle({
    componentWillReceiveProps (nextProps) {
      const nextAcceptedFile = nextProps.acceptedFile
      if (this.props.acceptedFile !== nextAcceptedFile) {
        nextProps.updatePanels({
          type: nextAcceptedFile ? 'OPEN_PREVIEW' : 'CLOSE_PREVIEW'
        })
      }
    }
  })
)(
  class RoomFooter extends Component {
    render () {
      const {
        canWrite,
        closePending,
        commentQueueFull,
        dispatch,
        handleDropAccepted,
        handleDropRejected,
        headerHeight,
        isOwner,
        isBlog,
        loggedIn,
        onInputUpKey,
        onInputBlur,
        onInputFocus,
        onTextareaResize,
        openPending,
        panelState,
        roomActive,
        roomCompleted,
        roomId,
        roomUI,
        showAddComment,
        showBubble,
        style,
        toggleTopicInput
      } = this.props

      return (
        <WindowState onResize={() => this.measureEl.measure}>
          {({ scrollTop, winHeight }) => {
            return (
              <Measure
                ref={node => {
                  this.measureEl = node
                }}
                whiteList={['height', 'top']}
              >
                {({ height = 0, top }) => {
                  return (
                    <FileDrop
                      className={css(styles.roomFooter)}
                      enabled={loggedIn}
                      fullscreenBackdrop
                      onDropAccepted={handleDropAccepted}
                      onDropRejected={handleDropRejected}
                    >
                      {(
                        { acceptedFile, openDropZoneManually, resetDropZone }
                      ) => {
                        return (
                          <footer
                            style={style}
                            onPaste={e => {
                              const data = new DataTransfer(e.clipboardData)
                              const files = data.getFiles()
                              if (data.isImage() && files.length) {
                                handleDropAccepted(files[0])
                              }
                            }}
                          >
                            {roomCompleted && <ShareRoom roomId={roomId} />}
                            {(showAddComment || showBubble) &&
                              <div className={css(styles.footerMenu)}>
                                {isOwner &&
                                  !roomUI.showTopicInput &&
                                  <RoomTopicButton
                                    onClick={toggleTopicInput}
                                  />}
                                {canWrite &&
                                  roomActive &&
                                  <PendingCommentsButton
                                    style={{ marginLeft: 8 }}
                                    onClick={openPending}
                                    roomId={roomId}
                                  />}
                                {loggedIn &&
                                  <ImageUploadButton
                                    style={{ marginLeft: 8 }}
                                    onClick={openDropZoneManually}
                                  />}
                              </div>}
                            {showBubble &&
                              <ConnectedBubble
                                editingMessageId={roomUI.editingMessageId}
                                isBlog={isBlog}
                                onHeightChange={onTextareaResize}
                                onInputUpKey={onInputUpKey}
                                onFocus={onInputFocus}
                                onBlur={onInputBlur}
                                roomId={roomId}
                              />}
                            {showAddComment &&
                              <CommentInput
                                acceptedFile={acceptedFile}
                                dispatch={dispatch}
                                commentQueueFull={commentQueueFull}
                                loggedIn={loggedIn}
                                onHeightChange={onTextareaResize}
                                onFocus={onInputFocus}
                                onBlur={onInputBlur}
                                resetDropZone={resetDropZone}
                                roomId={roomId}
                              />}
                            {showAddComment &&
                              <BottomPanel
                                showContents={acceptedFile}
                                style={{
                                  bottom: height - 60
                                }}
                              >
                                <FilePreview
                                  file={acceptedFile || { preview: '' }}
                                  imgMaxHeight={top - (headerHeight + 24)}
                                  onCloseClick={resetDropZone}
                                />
                              </BottomPanel>}
                            <BottomPanel
                              showContents={panelState.pending}
                              style={{
                                bottom: height - 60
                              }}
                            >
                              <PendingCommentList
                                roomId={roomId}
                                headerHeight={headerHeight}
                                onClose={closePending}
                                top={top}
                              />
                            </BottomPanel>
                          </footer>
                        )
                      }}
                    </FileDrop>
                  )
                }}
              </Measure>
            )
          }}
        </WindowState>
      )
    }
  }
)

const styles = StyleSheet.create({
  roomFooter: {
    position: 'relative',
    background: colors.white,
    width: 'calc(100% - 1rem)',
    maxWidth: breakpoints.tablet,
    marginRight: 'auto',
    marginBottom: 16,
    marginLeft: 'auto',
    [mediaQueries.phone]: {
      width: 'calc(100% - 2rem)'
    }
  },
  footerMenu: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 44,
    paddingTop: 4,
    paddingRight: 4,
    paddingBottom: 4,
    paddingLeft: 4
  },
  pendingCommentsButton: {
    fill: colors.darkgray,
    cursor: 'pointer',
    ':hover': {
      fill: colors.brandgreen
    }
  }
})
