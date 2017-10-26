import { Component } from 'react'
import { get } from 'lodash'
import removeMarkdown from 'remove-markdown'
import { css, StyleSheet } from 'aphrodite/no-important'
import Link from 'react-router-dom/es/Link'
import { colors, font } from 'style'
import TextParticipantList from 'room/TextParticipantList'
import RoomDate from 'room/RoomDate'
import AudienceCount from 'room/AudienceCount'

export default class RoomListItem extends Component {
  render () {
    const { comment, excludeUserId, room, style, isFirst, isLast } = this.props
    const roomActive = room.status === 'active'
    let splitAndCleanSummary = removeMarkdown(
      comment || room.description || ''
    ).split('\n')
    const summary = splitAndCleanSummary.find(str => str.trim().length)

    return (
      <div
        className={css(
          styles.listItem,
          isFirst && styles.firstItem,
          isLast && styles.lastItem
        )}
        style={style}
      >
        <div className={css(styles.header)}>
          <div className={css(styles.titleRow)}>
            <Link
              className={css(styles.title, !roomActive && styles.inactiveTitle)}
              to={`/room/${room.id}`}
            >
              {room.title}
            </Link>
            {summary &&
              summary.length &&
              <div className={css(styles.summary)}>
                {
                  `${summary
                    .substr(0, 140)
                    .trim()}${summary.length > 140 || splitAndCleanSummary.length > 1 ? '…' : ''}`
                }
              </div>}
          </div>
          <AudienceCount
            className={css(styles.audienceCount)}
            roomStatus={room.status}
            {...get(room, 'system', {})}
          />
        </div>
        <TextParticipantList excludeUserId={excludeUserId} room={room} />
        <RoomDate room={room} />
      </div>
    )
  }
}

const styles = StyleSheet.create({
  listItem: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    paddingTop: 16,
    paddingRight: 0,
    paddingBottom: 16,
    paddingLeft: 0,
    background: colors.white
  },
  firstItem: {
    paddingTop: 8
  },
  lastItem: {
    paddingBottom: 8
  },
  header: {
    display: 'flex',
    paddingBottom: 4
  },
  titleRow: {
    flex: 1
  },
  title: {
    ...font.headline,
    paddingRight: 8,
    fontWeight: 'bold',
    color: colors.darkgray,
    ':hover': {
      color: colors.brandgreen,
      cursor: 'pointer'
    }
  },
  audienceCount: {
    ...font.caption,
    flex: 'none',
    marginLeft: 'auto',
    minWidth: 72,
    textAlign: 'right',
    paddingTop: 8,
    color: colors.midgray
  },
  summary: {
    ...font.body2,
    paddingTop: 4,
    color: colors.midgray
  },
  status: {
    marginLeft: 'auto',
    color: colors.lightgray
  },
  activeStatus: {
    padding: 4,
    color: colors.brandgreen
  }
})
