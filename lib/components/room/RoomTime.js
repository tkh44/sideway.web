import { DOM } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font, mediaQueries } from 'style'
import compose from 'recompose/compose'
import defaultProps from 'recompose/defaultProps'
import withState from 'recompose/withState'
import withHandlers from 'recompose/withHandlers'
import DatePicker from 'ui/DatePicker'
import Button from 'ui/Button'
import { dateToString } from 'utils/date'
import { roomActions } from 'redux/rooms'

const RoomTime = compose(
  defaultProps({
    onDateClick: () => {},
    onSaveSuccess: () => {},
    onSaveError: () => {}
  }),
  withState('showPicker', 'togglePicker', false),
  withState('date', 'updateDate', ({ roomTime = new Date().getTime() }) => {
    const date = new Date(roomTime)
    let minute = date.getMinutes() > 55
      ? 0
      : Math.ceil(date.getMinutes() / 5) * 5
    let hour = date.getHours()

    if (
      date.getMinutes() > 55 ||
      (date.getMinutes() === 55 && date.getSeconds() > 0)
    ) {
      minute = 0
      hour = hour + 1
    } else {
      minute = Math.ceil(date.getMinutes() / 5) * 5
      hour = date.getHours()
    }

    const clone = new Date(date)
    clone.setHours(hour)
    clone.setMinutes(minute)
    return clone
  }),
  withHandlers({
    onDateClick: ({ togglePicker, onDateClick }) =>
      () => {
        togglePicker(true)
        onDateClick()
      },
    onCancelClick: ({ togglePicker }) => () => togglePicker(false),
    onDateChange: ({ updateDate }) => nextDate => updateDate(nextDate),
    onDateSaveClick: (
      { dispatch, date, roomId, togglePicker, onSaveSuccess, onSaveError }
    ) => {
      return async () => {
        const res = await dispatch(
          roomActions.patchRoom(roomId, { time: date.getTime() })
        )
        togglePicker(false)
        if (res.ok) {
          onSaveSuccess(res)
        } else {
          onSaveError(res)
        }
      }
    },
    onDateClearClick: ({ dispatch, roomId, togglePicker }) => {
      return async () => {
        await dispatch(roomActions.patchRoom(roomId, { time: null }))
        togglePicker(false)
      }
    }
  })
)(({
  date,
  onDateChange,
  onDateSaveClick,
  onDateClearClick,
  isOwner,
  roomStarted,
  roomTime,
  onCancelClick,
  onDateClick,
  showPicker,
  roomPending
}) => {
  if (roomStarted) {
    return (
      <div className={css(styles.timeWrapper, styles.notEditing)}>
        <span>
          {dateToString(roomStarted)}
        </span>
      </div>
    )
  }

  if (roomTime && !showPicker) {
    return (
      <div className={css(styles.timeWrapper, styles.notEditing)}>
        <span
          className={css(styles.setStartLink, isOwner && styles.isClickable)}
          onClick={isOwner && onDateClick}
          role='button'
          tabIndex={0}
        >
          {`Scheduled to start on ${dateToString(roomTime)}`}
        </span>
        {isOwner &&
          <Button
            color='red'
            type='button'
            textOnly
            onClick={onDateClearClick}
            label='Clear Start Time'
            tooltip
          >
            clear
          </Button>}
      </div>
    )
  }

  if (!isOwner) {
    return DOM.noscript()
  }

  return (
    <div className={css(styles.timeWrapper)}>
      {!showPicker &&
        <div
          key='start-time'
          className={css(styles.setStartLink, styles.isClickable)}
          onClick={onDateClick}
          role='button'
          tabIndex={0}
        >
          Set a start time
        </div>}
      {showPicker &&
        <DatePicker key='date-picker' date={date} onChange={onDateChange} />}
      {showPicker &&
        <div key='action-wrapper' className={css(styles.actionWrapper)}>
          <Button
            color='darkgray'
            style={{ ...font.body1 }}
            textOnly
            onClick={onCancelClick}
            label='Cancel Setting Start Time'
          >
            Cancel
          </Button>
          <Button
            color='brandgreen'
            style={{
              ...font.body1,
              marginLeft: 16
            }}
            textOnly
            onClick={onDateSaveClick}
            label='Save Start Time'
          >
            Save
          </Button>
        </div>}
    </div>
  )
})

const styles = StyleSheet.create({
  timeWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '100%',
    marginTop: 16
  },
  notEditing: {
    ...font.title,
    flexDirection: 'row',
    flexWrap: 'wrap',
    textAlign: 'center',
    color: colors.lightgray
  },
  setStartLink: {
    ...font.body1,
    color: colors.lightgray,
    borderBottom: `1px solid ${colors.transparent}`,
    [mediaQueries.tablet]: {
      ...font.title
    }
  },
  isClickable: {
    ':hover': {
      cursor: 'pointer',
      borderBottom: `1px solid ${colors.brandgreen}`
    },
    ':focus': {
      borderBottom: `1px solid ${colors.brandgreen}`
    }
  },
  actionWrapper: {
    ...font.body1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingLeft: 8,
    paddingBottom: 8
  },
  ownerWhen: {
    ...font.title
  }
})

export default RoomTime
