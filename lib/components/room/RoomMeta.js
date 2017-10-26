import { Component } from 'react'
import { findDOMNode } from 'react-dom'
import { get } from 'lodash'
import { css, StyleSheet } from 'aphrodite/no-important'
import { animation, colors, font, mediaQueries } from 'style'
import compose from 'recompose/compose'
import defaultProps from 'recompose/defaultProps'
import withPropsOnChange from 'recompose/withPropsOnChange'
import withHandlers from 'recompose/withHandlers'
import RoomTime from 'room/RoomTime'
import RoomStartButton from 'room/RoomStartButton'
import RoomNotifyStartToggle from 'room/RoomNotifyStartToggle'
import ShareRoom from 'room/ShareRoom'
import EditableText from 'ui/EditableText'
import FormattedText from 'ui/FormattedText'
import ControlledPopover from 'ui/ControlledPopover'
import CardTooltip from 'ui/CardTooltip'
import { roomActions } from 'redux/rooms'
import { roomUIActions } from 'redux/room-ui'

const TITLE_CHAR_LIMIT = 127
const DESCRIPTION_CHAR_LIMIT = 2048
const popoverStyle = {
  ...font.body1,
  fontWeight: 'bold',
  color: colors.darkgray,
  paddingTop: 6,
  paddingRight: 16,
  paddingBottom: 6,
  paddingLeft: 16,
  cursor: 'pointer',
  borderRadius: 2
}

export default compose(
  defaultProps({
    title: '',
    description: ''
  }),
  withPropsOnChange(['loggedIn', 'isOwner', 'push', 'roomPending'], ({
    loggedIn,
    isOwner,
    push,
    roomPending
  }) => ({
    showNotificationToggle: loggedIn && roomPending && push.support
  })),
  withPropsOnChange(['roomUI'], ({ roomUI }) => ({
    roomIntro: get(roomUI, 'intro', {})
  })),
  withHandlers({
    patchRoom: ({ dispatch, roomId }) => {
      return payload => dispatch(roomActions.patchRoom(roomId, payload))
    }
  })
)(
  class RoomMeta extends Component {
    hideIntroTimeout = null;

    constructor (props) {
      super(props)
      this.state = {
        description: props.description,
        descriptionError: null,
        savingDescription: false,
        title: props.title,
        titleError: null,
        savingTitle: false
      }
    }

    componentWillReceiveProps (nextProps) {
      const nextState = {}
      if (
        this.props.title !== nextProps.title &&
        document.activeElement !== findDOMNode(this.titleInput)
      ) {
        nextState.title = nextProps.title
      }

      if (
        this.props.description !== nextProps.description &&
        document.activeElement !== findDOMNode(this.descriptionInput)
      ) {
        nextState.description = nextProps.description
      }

      if (Object.keys(nextState).length) {
        this.setState(nextState)
      }
    }

    componentWillUnmount () {
      window.clearTimeout(this.hideIntroTimeout)
    }

    render () {
      const {
        description,
        dispatch,
        isAdmin,
        isOwner,
        links,
        roomId,
        roomPending,
        roomStarted,
        roomTime,
        showNotificationToggle,
        title
      } = this.props

      if (isOwner || isAdmin) {
        return this.renderEditableMeta()
      }

      return (
        <div className={css(styles.roomMeta)}>
          <div className={css(styles.title)}>
            {title}
          </div>
          {description &&
            <div className={css(styles.description)}>
              <FormattedText
                text={description}
                links={links}
                displayNodesAsBlocks
              />
            </div>}
          {roomPending &&
            <RoomTime
              dispatch={dispatch}
              isOwner={isOwner}
              roomId={roomId}
              roomPending={roomPending}
              roomStarted={roomStarted}
              roomTime={roomTime}
            />}
          {showNotificationToggle && <RoomNotifyStartToggle roomId={roomId} />}
          <ShareRoom roomId={roomId} />
        </div>
      )
    }

    renderEditableMeta () {
      const {
        dispatch,
        isOwner,
        links,
        roomId,
        roomPending,
        roomStarted,
        roomTime,
        roomIntro,
        showNotificationToggle
      } = this.props

      return (
        <div className={css(styles.roomMeta)}>
          <EditableText
            ref={node => {
              this.titleInput = node
            }}
            className={css(
              styles.title,
              styles.editable,
              this.state.titleError && styles.fieldError
            )}
            editClassName={css(styles.isEditing)}
            blurOnEnterPress
            placeholder='Conversation title'
            value={this.state.title}
            isFetching={this.state.savingTitle}
            hasError={this.state.titleError}
            onBlur={this.handleTitleBlur}
            onChange={this.handleTitleChange}
            renderFormattedText={false}
            maxCharCount={TITLE_CHAR_LIMIT}
          />
          <ControlledPopover
            arrowSize={0}
            open={roomIntro.enabled && roomIntro.step === 1}
            className={css(styles.roomIntroArea)}
            popoverComponent={CardTooltip.Popover}
            popoverProps={{
              tooltip: 'What is this conversation about?',
              onClick: this.handleIntroPopoverClick,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderColor: colors.lightgray,
              style: popoverStyle
            }}
          >
            <EditableText
              ref={node => {
                this.descriptionInput = node
              }}
              className={css(
                styles.description,
                styles.editable,
                this.state.descriptionError && styles.fieldError
              )}
              editClassName={css(styles.isEditing)}
              placeholderClassName={css(styles.placeholderClassName)}
              textClassName={css(styles.textClassName)}
              placeholder='Add a Description or Introduction'
              value={this.state.description}
              isFetching={this.state.savingDescription}
              hasError={this.state.descriptionError}
              onBlur={this.handleDescriptionBlur}
              onChange={this.handleDescriptionChange}
              onClick={this.handleDescriptionClick}
              maxRows={Infinity}
              renderFormattedText
              formattedTextLinks={links}
              maxCharCount={DESCRIPTION_CHAR_LIMIT}
            />
          </ControlledPopover>
          {roomPending &&
            <ControlledPopover
              arrowSize={8}
              open={roomIntro.enabled && roomIntro.step === 2}
              className={css(styles.roomIntroArea)}
              popoverComponent={CardTooltip.Popover}
              popoverProps={{
                tooltip: 'When do you want the conversation to start?',
                onClick: this.handleIntroPopoverClick,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                borderColor: colors.lightgray,
                style: popoverStyle
              }}
            >
              {roomPending &&
                <RoomTime
                  dispatch={dispatch}
                  isOwner={isOwner}
                  onDateClick={this.handleRoomTimeClick}
                  onSaveSuccess={this.handleRoomTimeSave}
                  roomId={roomId}
                  roomPending={roomPending}
                  roomStarted={roomStarted}
                  roomTime={roomTime}
                />}
            </ControlledPopover>}
          {showNotificationToggle && <RoomNotifyStartToggle roomId={roomId} />}
          <ControlledPopover
            arrowSize={2}
            open={roomIntro.enabled && roomIntro.step === 3}
            className={css(styles.roomIntroArea)}
            popoverComponent={CardTooltip.Popover}
            popoverProps={{
              tooltip: 'Let your audience know about the upcoming conversation.',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderColor: colors.lightgray,
              onClick: this.handleIntroPopoverClick,
              style: popoverStyle
            }}
          >
            <ShareRoom roomId={roomId} />
          </ControlledPopover>
          {roomPending &&
            <RoomStartButton dispatch={dispatch} roomId={roomId} />}
        </div>
      )
    }

    handleTitleChange = ({ target: { value } }) =>
      this.setState({
        title: value,
        titleError: !this.state.title.trim().length ||
          this.state.title.length > TITLE_CHAR_LIMIT
      });

    handleTitleBlur = async () => {
      if (this.state.titleError) {
        return
      }

      if (this.props.title !== this.state.title) {
        this.setState({ savingTitle: true })
        const res = await this.props.patchRoom({ title: this.state.title })
        this.setState({
          savingTitle: false,
          titleError: res.ok ? null : res.data
        })
      }
    };

    handleDescriptionChange = ({ target: { value } }) => {
      this.setState({
        description: value,
        descriptionError: value.length > DESCRIPTION_CHAR_LIMIT
      })
    };

    handleDescriptionBlur = async () => {
      if (this.state.descriptionError) {
        return
      }

      const { dispatch, roomId, roomIntro } = this.props

      if (this.props.description !== this.state.description) {
        this.setState({ savingDescription: true })
        const res = await this.props.patchRoom({
          description: this.state.description
        })
        this.setState({
          savingDescription: false,
          descriptionError: res.ok ? null : res.data
        })
        if (roomIntro.enabled) {
          dispatch(roomUIActions.setRoomIntroStep({ roomId: roomId, step: 2 }))
        }
      }
    };

    handleDescriptionClick = () => {
      const { dispatch, roomId, roomIntro } = this.props
      if (roomIntro.enabled && roomIntro.step === 1) {
        dispatch(roomUIActions.setRoomIntroStep({ roomId, step: null }))
      }
    };

    handleRoomTimeClick = () => {
      const { dispatch, roomId, roomIntro } = this.props

      if (roomIntro.enabled && roomIntro.step === 2) {
        dispatch(roomUIActions.setRoomIntroStep({ roomId, step: null }))
      }
    };

    handleRoomTimeSave = res => {
      const { dispatch, roomId, roomIntro } = this.props

      if (roomIntro.enabled) {
        dispatch(roomUIActions.setRoomIntroStep({ roomId: roomId, step: 3 }))
        this.hideIntroTimeout = setTimeout(
          () => {
            dispatch(roomUIActions.disableRoomIntro({ roomId: roomId }))
          },
          5000
        )
      }
    };

    handleIntroPopoverClick = () => {
      const { dispatch, roomId } = this.props
      dispatch(roomUIActions.setRoomIntroStep({ roomId, step: null }))
    };
  }
)

const styles = StyleSheet.create({
  roomMeta: {
    width: '100%',
    paddingBottom: 16
  },
  title: {
    ...font.display1,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.darkgray,
    [mediaQueries.tablet]: {
      ...font.display2,
      marginBottom: 16
    }
  },
  description: {
    ...font.body1,
    whiteSpace: 'pre-wrap',
    color: colors.darkgray,
    [mediaQueries.tablet]: {
      ...font.title
    }
  },
  editable: {
    marginTop: 5,
    // padding: 3,
    padding: 0,
    borderBottom: '1px solid transparent',
    cursor: 'pointer',
    // transition: `font 200ms ${animation.timingFn}`,
    ':active': {
      cursor: 'text'
    },
    ':hover': {
      borderBottom: `1px solid ${colors.brandgreen}`
    },
    ':focus': {
      borderBottom: `1px solid ${colors.brandgreen}`,
      cursor: 'text'
    }
  },
  fieldError: {
    borderBottom: `1px solid ${colors.red}`,
    cursor: 'pointer',
    ':active': {
      cursor: 'text'
    },
    ':hover': {
      borderBottom: `1px solid ${colors.red}`
    },
    ':focus': {
      borderBottom: `1px solid ${colors.red}`,
      cursor: 'text'
    }
  },
  isEditing: {
    cursor: 'initial'
  },
  textClassName: {
    whiteSpace: 'pre-wrap'
  },
  placeholderClassName: {
    // alignSelf: 'center',
    color: colors.lightgray
  },
  roomIntroArea: {
    width: '100%',
    marginBottom: 16,
    padding: 0
  }
})
