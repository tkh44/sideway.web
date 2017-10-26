import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'
import { dateToDateString, dateToString } from 'utils/date'

export default function RoomDate ({ room }) {
  if (room.status === 'pending') {
    return (
      <div className={css(styles.roomDate)}>
        {room.time ? dateToString(room.time) : 'Upcoming'}
      </div>
    )
  }

  if (room.status === 'active') {
    return null
  }

  return (
    <div className={css(styles.roomDate)}>
      {dateToDateString(room.started)}
    </div>
  )
}

const styles = StyleSheet.create({
  roomDate: {
    ...font.body2,
    paddingBottom: 4,
    color: colors.lightgray
  }
})
