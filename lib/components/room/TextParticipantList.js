import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'
import Popover from 'ui/Popover'
import UserCardTooltip from 'ui/UserCardTooltip'
import { participantsToUsers } from 'selectors/rooms'
import DisplayName from 'ui/DisplayName'

export default function ListItemParticipantList ({ excludeUserId, room }) {
  const participants = participantsToUsers(room.participants, room.owner, true)
  const excludedUserIdInParticipants = participants.some(
    u => u.id === excludeUserId
  )
  const list = participants.filter(
    user => !user.disabled && user.id !== excludeUserId
  )

  if (!list.length) {
    return null
  }

  return (
    <span className={css(styles.participantList)}>
      <span className={css(styles.preposition)}>
        {excludedUserIdInParticipants ? 'With ' : 'By '}
      </span>
      {list.map((user, i) => (
        <span key={user.id} className={css(styles.participantName)}>
          {list.length >= 2 && i === list.length - 1 ? 'and ' : ''}
          <Popover
            className={css(styles.popoverAnchor)}
            component='span'
            popoverComponent={UserCardTooltip}
            popoverProps={{ user }}
          >
            <DisplayName
              className={css(styles.displayName)}
              user={{
                username: user.username,
                display: `${user.display}${list.length === 2 ? ' ' : i === list.length - 1 ? '' : ', '}`
              }}
            />
          </Popover>
        </span>
      ))}
    </span>
  )
}

const styles = StyleSheet.create({
  participantList: {
    ...font.caption,
    paddingTop: 4,
    paddingRight: 0,
    paddingBottom: 4,
    paddingLeft: 0,
    color: colors.lightgray
  },
  participantName: {
    display: 'inline',
    whiteSpace: 'pre-wrap'
  },
  popoverAnchor: {},
  displayName: {
    color: colors.brandgreen,
    ':hover': {
      color: colors.brandgreen
    }
  },
  preposition: {
    display: 'inline',
    color: colors.lightgray,
    whiteSpace: 'pre-wrap'
  }
})
