import { Component } from 'react'
import { connect } from 'react-redux'
import { get } from 'lodash'
// import { DragDropContext, DragSource, DropTarget } from 'react-dnd'
// import HTML5Backend from 'react-dnd-html5-backend'
import compose from 'recompose/compose'
import withPropsOnChange from 'recompose/withPropsOnChange'
import withProps from 'recompose/withProps'
import Redirect from 'react-router-dom/es/Redirect'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'
import updateDocTitle from 'hoc/update-doc-title'
import scrollTopOnMount from 'hoc/scrollTopOnMount'
import UserSubheader from 'ui/UserSubheader'
import StandardPage from 'ui/StandardPage'
import EditableText from 'ui/EditableText'
import FormattedText from 'ui/FormattedText'
import Header from 'ui/Header'
import Footer from 'ui/Footer'
import RoomListItem from 'room/RoomListItem'
import { pageActions } from 'redux/pages'
import { groupPageRoomsBySection } from 'selectors/pages'

// const UP = -1
// const DOWN = 1

class OwnerHeader extends Component {
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

  render () {
    return (
      <div className={css(styles.header)}>
        <EditableText
          className={css(styles.title, styles.editable)}
          editClassName={css(styles.isEditing)}
          blurOnEnterPress
          placeholder='Page title'
          value={this.state.title}
          isFetching={this.state.savingTitle}
          hasError={this.state.titleError}
          onChange={this.handleTitleChange}
          onBlur={this.handleTitleBlur}
          renderFormattedText={false}
        />
        <EditableText
          className={css(styles.description, styles.editable)}
          editClassName={css(styles.isEditing, styles.descriptionEditing)}
          placeholderClassName={css(styles.placeholderClassName)}
          textClassName={css(styles.textClassName)}
          placeholder='Add a description'
          value={this.state.description}
          isFetching={this.state.savingDescription}
          hasError={this.state.descriptionError}
          onChange={this.handleDescriptionChange}
          onBlur={this.handleDescriptionBlur}
          maxRows={Infinity}
          renderFormattedText
          formattedTextLinks={[]}
        />
      </div>
    )
  }

  handleTitleChange = e =>
    this.setState({ title: e.target.value, titleError: false });

  handleTitleBlur = async () => {
    const { dispatch, title, pageId } = this.props
    if (this.state.title && title !== this.state.title) {
      this.setState({ savingTitle: true })
      const res = await dispatch(
        pageActions.patch(pageId, { title: this.state.title })
      )
      this.setState({
        savingTitle: false,
        titleError: res.ok ? null : res.data
      })
    }
  };

  handleDescriptionChange = e =>
    this.setState({ description: e.target.value, descriptionError: false });

  handleDescriptionBlur = async () => {
    const { dispatch, description, pageId } = this.props
    if (description !== this.state.description) {
      this.setState({ savingDescription: true })
      const res = await dispatch(
        pageActions.patch(pageId, { description: this.state.description })
      )
      this.setState({
        savingDescription: false,
        descriptionError: res.ok ? null : res.data
      })
    }
  };
}

function GuestHeader ({ title, description, links = [] }) {
  return (
    <div className={css(styles.header)}>
      <div className={css(styles.title)}>
        {title}
      </div>
      <div className={css(styles.description)}>
        <FormattedText
          text={description}
          links={links}
          displayNodesAsBlocks
        />
      </div>
    </div>
  )
}

// const DragTypes = {
//   ROOM: 'room'
// }
//
// const roomSource = {
//   beginDrag ({ room, index, priority, sectionTitle }) {
//     return {
//       id: room.id,
//       priority,
//       index,
//       sectionTitle
//     }
//   },
//
//   endDrag (props, monitor) {
//     const item = monitor.getItem()
//     const didDrop = monitor.didDrop()
//
//     if (didDrop) {
//       props.dropRoom(item, props)
//     }
//   }
// }
//
// const roomItemTarget = {
//   hover (props, monitor, component) {
//     const item = monitor.getItem()
//     const hoverId = props.room.id
//     if (item.id === hoverId) {
//       return
//     }
//
//     const dragSection = item.sectionTitle
//     const hoverSection = props.sectionTitle
//     let direction = 0   // 1 is down / -1 is up
//
//     if (dragSection === hoverSection) { // if same section direction based on priority
//       if (item.priority < hoverSection.priority) {
//         direction = DOWN
//       } else {
//         direction = UP
//       }
//     } else if (dragSection < hoverSection) { // if dif sections based on section alpha sort
//       direction = DOWN
//     } else {
//       direction = UP
//     }
//
//     props.moveRoom(item, props, direction)
//   },
//
//   drop (props, monitor) {
//     const item = monitor.getItem()
//     props.dropRoom(item, props)
//   }
// }
// const targetCollect = (connect, monitor) => ({
//   connectDropTarget: connect.dropTarget()
// })
//
// const sourceCollect = (connect, monitor) => ({
//   connectDragSource: connect.dragSource(),
//   isDragging: monitor.isDragging()
// })

// const DraggableRoomListItem = compose(
//   DragSource(DragTypes.ROOM, roomSource, sourceCollect),
//   DropTarget(DragTypes.ROOM, roomItemTarget, targetCollect)
// )(class DraggableRoomListItem extends Component {
//
//   render () {
//     const { connectDragSource, connectDropTarget, isDragging, ...rest } = this.props
//     return connectDropTarget(connectDragSource(
//       React.createElement('div',
//         {
//           style: {
//             opacity: isDragging ? 0.5 : 1,
//             cursor: 'move'
//           }
//         },
//         React.createElement(RoomListItem, rest)
//       )
//     ))
//   }
// })

class ListSectionHeader extends Component {
  constructor (props) {
    super(props)

    this.state = {
      sectionHeader: props.sectionTitle,
      saveError: '',
      lastSavedSectionHeader: ''
    }
  }

  render () {
    const { isOwner, sectionTitle } = this.props

    return (
      <div className={css(styles.sectionHeader)}>
        {isOwner
          ? <EditableText
            className={css(styles.sectionTitle, styles.editable)}
            editClassName={css(styles.isEditing)}
            blurOnEnterPress
            placeholder='Section Header'
            value={this.state.sectionHeader}
            isFetching={this.state.savingTitle}
            hasError={this.state.titleError}
            onChange={this.handleSectionChange}
            onBlur={this.handleSectionBlur}
            renderFormattedText={false}
            />
          : <span className={css(styles.sectionTitle)}>
            {sectionTitle}
          </span>}
        {this.state.saveError &&
          <div className={css(styles.error)}>
            There was a problem saving your section name
          </div>}
      </div>
    )
  }

  handleSectionChange = ({ target: { value } }) =>
    this.setState({ sectionHeader: value, saveError: false });

  handleSectionBlur = async () => {
    const { dispatch, pageId, rooms, sectionTitle } = this.props
    const input = this.state.sectionHeader.trim()
    this.setState({ saveError: false })

    if (!input || input.length === 0) {
      this.setState({
        sectionHeader: this.state.lastSavedSectionHeader ||
          this.props.sectionTitle
      })
      return
    }

    if (input !== sectionTitle) {
      const responses = await Promise.all(
        rooms.map(r =>
          dispatch(pageActions.patchRoom(pageId, r.id, { section: input })))
      )
      if (responses.some(r => !r.ok)) {
        this.setState({ saveError: true })
      } else {
        this.setState({ lastSavedSectionHeader: input })
      }
    }
  };
}

class ListSection extends Component {
  render () {
    const {
      dispatch,
      dropRoom,
      isOwner,
      moveRoom,
      pageId,
      profileId,
      rooms,
      sectionTitle
    } = this.props

    return (
      <section className={css(styles.section)}>
        <ListSectionHeader
          dispatch={dispatch}
          isOwner={isOwner}
          pageId={pageId}
          rooms={rooms}
          sectionTitle={sectionTitle}
        />
        {rooms.map((room, i, list) => (
          <RoomListItem
            dropRoom={dropRoom}
            excludeUserId={profileId}
            index={i}
            isFirst={i === 0}
            isLast={i === list.length - 1}
            key={room.id}
            moveRoom={moveRoom}
            priority={room.priority}
            room={{ ...room.room, id: room.id }}
            sectionTitle={sectionTitle}
          />
        ))}
      </section>
    )
  }
}

class PageRoomList extends Component {
  render () {
    const {
      dispatch,
      dropRoom,
      groupedRooms,
      isOwner,
      moveRoom,
      page,
      profileId
    } = this.props

    return (
      <div>
        {Object.keys(groupedRooms).sort().map(sectionTitle => {
          const roomIdList = groupedRooms[sectionTitle]
          return (
            <ListSection
              key={'section--' + sectionTitle}
              dispatch={dispatch}
              isOwner={isOwner}
              dropRoom={dropRoom}
              moveRoom={moveRoom}
              pageId={page.id}
              profileId={profileId}
              rooms={roomIdList.map(id => page.rooms[id])}
              sectionTitle={sectionTitle}
            />
          )
        })}
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const pageId = props.match.params.page

  return {
    page: state.pages[pageId] || { rooms: {} },
    profile: state.profile
  }
}

export default compose(
  connect(mapStateToProps),
  updateDocTitle(props => props.page.title),
  scrollTopOnMount,
  withProps(({ page, profile }) => {
    return {
      isOwner: profile.id === get(page, 'owner.id', '')
    }
  }),
  withPropsOnChange(['page'], ({ page }) => ({
    groupedRooms: groupPageRoomsBySection(page)
  }))
  // DragDropContext(HTML5Backend)
)(
  class PageDetail extends Component {
    moveAnimId = false;

    componentDidMount () {
      this.fetchPage()
    }

    componentWillUnmount () {
      window.cancelAnimationFrame(this.moveAnimId)
    }

    render () {
      const {
        dispatch,
        groupedRooms,
        isOwner,
        page,
        profile
      } = this.props
      const reqMeta = get(page, '$$meta', {})
      const { fetching, status } = reqMeta

      if (fetching === false && status !== 200) {
        return <Redirect to={status === 404 ? '/404' : '/500'} />
      }

      return (
        <StandardPage header={Header} footer={Footer}>
          <UserSubheader
            displayStyle={{
              ...font.body1,
              paddingTop: 3,
              lineHeight: '1.2',
              fontWeight: 'normal'
            }}
            showTwitter={false}
            showUsername
            size='large'
            user={page.owner}
          />
          {isOwner
            ? <OwnerHeader
              description={page.description}
              dispatch={dispatch}
              pageId={page.id}
              title={page.title}
              links={page.links}
              />
            : <GuestHeader description={page.description} title={page.title} />}
          <div className={css(styles.content)}>
            <PageRoomList
              dispatch={dispatch}
              groupedRooms={groupedRooms}
              isOwner={isOwner}
              dropRoom={this.dropRoom}
              moveRoom={this.moveRoom}
              page={page}
              profileId={profile.id}
            />
          </div>
        </StandardPage>
      )
    }

    moveRoom = (dragItem, hoverProps, direction) => {
      if (
        dragItem.sectionTitle === hoverProps.sectionTitle &&
        dragItem.priority === hoverProps.priority + direction
      ) {
        return
      }

      if (this.moveAnimId) {
        window.cancelAnimationFrame(this.moveAnimId)
        this.moveAnimId = null
      }

      this.moveAnimId = window.requestAnimationFrame(() => {
        const { dispatch, page } = this.props
        dispatch(
          pageActions.changeRoomListPosition(
            page.id,
            dragItem.id,
            hoverProps.room.id,
            direction
          )
        )
        this.moveAnimId = null
      })
    };

    dropRoom = (dropItem, hoverProps) => {
      const { dispatch, page } = this.props
      const payload = {
        priority: dropItem.priority,
        section: dropItem.sectionTitle
      }
      dispatch(pageActions.patchRoom(page.id, dropItem.id, payload))
    };

    fetchPage (accountToFetch) {
      const { dispatch, match: { params } } = this.props
      dispatch(pageActions.get(params.page))
    }
  }
)

const styles = StyleSheet.create({
  detailsHeader: {},
  header: {
    marginTop: 16,
    marginBottom: 16
  },
  title: {
    ...font.display1,
    paddingRight: 8,
    fontWeight: 'bold',
    color: colors.darkgray
  },
  description: {
    ...font.title,
    whiteSpace: 'pre-wrap',
    color: colors.darkgray
  },
  editable: {
    width: '100%',
    borderBottom: '1px solid transparent',
    cursor: 'pointer',
    ':active': {
      cursor: 'text'
    },
    ':hover': {
      cursor: 'pointer',
      borderBottom: `1px solid ${colors.brandgreen}`
    },
    ':focus': {
      borderBottom: `1px solid ${colors.brandgreen}`,
      cursor: 'text'
    }
  },
  isEditing: {
    padding: 0,
    margin: 0,
    cursor: 'initial'
  },
  descriptionEditing: {
    marginTop: 8,
    marginBottom: 4
  },
  placeholderClassName: {
    color: colors.lightgray
  },
  content: {},
  room: {},
  section: {
    paddingTop: 16,
    paddingBottom: 16
  },
  sectionHeader: {
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    ':before': {
      content: `' '`,
      position: 'absolute',
      right: 0,
      top: -1,
      left: 0,
      height: 1,
      width: '15%',
      minWidth: 80,
      backgroundColor: colors.lightgray
    },
    ':after': {
      content: `' '`,
      position: 'absolute',
      right: 0,
      top: -1,
      left: 0,
      height: 1,
      width: '100%',
      backgroundColor: colors.faintgray
    }
  },
  sectionTitle: {
    ...font.title,
    color: colors.lightgray,
    fontWeight: 'bold'
  },
  error: {
    ...font.caption,
    paddingBottom: 4,
    color: colors.red,
    width: '100%'
  }
})
