import compose from 'recompose/compose'
import withPropsOnChange from 'recompose/withPropsOnChange'
import branch from 'recompose/branch'
import renderNothing from 'recompose/renderNothing'
import renderComponent from 'recompose/renderComponent'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'
import Icon from 'art/Icon'
import { sortRooms } from 'selectors/rooms'

const ListSection = branch(
  ({ rooms }) => !!rooms.length,
  c => c,
  renderNothing
)(({
  dispatch,
  excludeUserId,
  iconName,
  itemComponent: ItemComponent,
  rooms,
  title
}) => (
  <section className={css(styles.section)}>
    <div className={css(styles.sectionHeader)}>
      <Icon
        name={iconName}
        fill={colors.lightgray}
        style={{
          width: 24,
          height: 24
        }}
      />
      <span className={css(styles.sectionTitle)}>
        {title}
      </span>
    </div>
    {rooms.map((room, i, list) => (
      <ItemComponent
        key={room.id}
        isFirst={i === 0}
        isLast={i === list.length - 1}
        dispatch={dispatch}
        excludeUserId={excludeUserId}
        room={room}
      />
    ))}
  </section>
))

const EmptyList = ({ emptyMessage }) => {
  return (
    <div className={css(styles.emptyList)}>
      {emptyMessage}
    </div>
  )
}

export default compose(
  withPropsOnChange(['rooms'], ({ rooms }) => {
    const [active, pending, completed] = sortRooms(rooms)
    return { active, pending, completed }
  }),
  branch(
    ({ active, pending, completed }) =>
      active.length || pending.length || completed.length,
    c => c,
    renderComponent(EmptyList)
  )
)(({
  active,
  completed,
  dispatch,
  emptyMessage,
  excludeUserId,
  itemComponent,
  pending
}) => {
  return (
    <article className={css(styles.roomList)}>
      <ListSection
        title='Live'
        iconName='horn'
        rooms={active}
        dispatch={dispatch}
        excludeUserId={excludeUserId}
        itemComponent={itemComponent}
      />
      <ListSection
        title='Upcoming'
        iconName='time-alarm'
        rooms={pending}
        dispatch={dispatch}
        excludeUserId={excludeUserId}
        itemComponent={itemComponent}
      />
      <ListSection
        title='Ended'
        iconName='paperbox'
        rooms={completed}
        dispatch={dispatch}
        excludeUserId={excludeUserId}
        itemComponent={itemComponent}
      />
    </article>
  )
})

const styles = StyleSheet.create({
  roomList: {
    width: '100%'
  },
  emptyList: {
    ...font.headline,
    padding: 32,
    color: colors.lightgray,
    textAlign: 'center'
  },
  section: {
    paddingTop: 16,
    paddingBottom: 16
  },
  sectionHeader: {
    ...font.title,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    color: colors.lightgray,
    fontWeight: 'bold',
    ':before': {
      content: "''",
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
      content: "''",
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
    marginLeft: 8
  }
})
