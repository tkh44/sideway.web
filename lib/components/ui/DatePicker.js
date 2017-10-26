import { css, StyleSheet } from 'aphrodite/no-important'
import { font } from 'style'
import compose from 'recompose/compose'
import withState from 'recompose/withState'
import withHandlers from 'recompose/withHandlers'
import SelectBox from 'ui/SelectBox'

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

const YearPicker = ({ date, onChange }) => {
  const thisYear = new Date().getFullYear()
  const nextYear = thisYear + 1

  return (
    <SelectBox
      style={{
        width: 82,
        marginRight: 8
      }}
      value={date.getFullYear()}
      onChange={onChange}
      options={[
        { label: thisYear, value: thisYear },
        { label: nextYear, value: nextYear }
      ]}
      placeholder='Year'
    />
  )
}

const MonthPicker = ({ onChange, date }) => {
  let monthsArray
  if (date.getFullYear() === new Date().getFullYear()) {
    monthsArray = MONTHS.slice(new Date().getMonth())
  } else {
    monthsArray = MONTHS
  }

  const startOffset = 12 - monthsArray.length
  const options = monthsArray.map((name, i) => {
    return { label: name, value: i + startOffset }
  })

  return (
    <SelectBox
      className={css(styles.customSelect, styles.month)}
      style={{
        marginRight: 8,
        width: 72
      }}
      value={date.getMonth()}
      onChange={onChange}
      options={options}
      placeholder='Month'
    />
  )
}

const DayPicker = ({ onChange, date }) => {
  return (
    <SelectBox
      style={{
        width: 60,
        marginRight: 8
      }}
      value={date.getDate()}
      onChange={onChange}
      options={Array.from({
        length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
      }).map((_, i) => {
        return { label: i + 1, value: i + 1 }
      })}
      placeholder='Day'
    />
  )
}

const HourPicker = ({ onChange, date, meridiem }) => {
  const offset = meridiem === 'am' ? 1 : 13
  const options = Array.from({ length: 12 }).map((_, i) => ({
    label: i + 1,
    value: i + offset
  }))

  if (meridiem === 'am') {
    options[options.length - 1] = { label: 12, value: 0 }
  } else if (meridiem === 'pm') {
    options[options.length - 1] = { label: 12, value: 12 }
  }

  return (
    <SelectBox
      style={{
        width: 54,
        marginRight: 0
      }}
      value={date.getHours()}
      onChange={onChange}
      options={options}
      placeholder='Hr'
    />
  )
}

const MinutePicker = ({ onChange, date }) => {
  return (
    <SelectBox
      style={{
        width: 56,
        marginRight: 8,
        marginLeft: 0
      }}
      value={date.getMinutes()}
      onChange={onChange}
      options={[
        { label: '00', value: 0 },
        { label: '05', value: 5 },
        { label: '10', value: 10 },
        { label: '15', value: 15 },
        { label: '20', value: 20 },
        { label: '25', value: 25 },
        { label: '30', value: 30 },
        { label: '35', value: 35 },
        { label: '40', value: 40 },
        { label: '45', value: 45 },
        { label: '50', value: 50 },
        { label: '55', value: 55 }
      ]}
      placeholder='Min'
    />
  )
}

const MeridiemPicker = ({ onChange, value }) => {
  return (
    <SelectBox
      style={{
        width: 60,
        marginRight: 8
      }}
      value={value}
      onChange={onChange}
      options={[{ label: 'AM', value: 'am' }, { label: 'PM', value: 'pm' }]}
      placeholder='Meridiems'
    />
  )
}

const DatePicker = compose(
  withState('meridiem', 'updateMeridiem', ({ date }) => {
    return date.getHours() < 12 ? 'am' : 'pm'
  }),
  withHandlers({
    onYearChange: ({ date, onChange }) => {
      return ({ value }) => {
        const clone = new Date(date.getTime())
        clone.setFullYear(value)

        if (
          value === new Date().getFullYear() &&
          clone.getMonth() < new Date().getMonth()
        ) {
          clone.setMonth(new Date().getMonth())
          onChange(clone)
        } else {
          onChange(clone)
        }
      }
    },
    onMonthChange: ({ date, onChange }) => {
      return ({ value }) => {
        const clone = new Date(date.getTime())
        clone.setMonth(value)

        if (date.getDate() !== clone.getDate()) {
          // Check if date overflowed into the next month e.g. oct 31st -> sept 31 -> oct 1
          clone.setDate(new Date(clone.getFullYear(), value + 1, 0).getDate())
          clone.setMonth(value)
          onChange(clone)
        } else {
          onChange(clone)
        }
      }
    },
    onDayChange: ({ date, onChange }) => {
      return ({ value }) => {
        const clone = new Date(date.getTime())
        clone.setDate(value)
        onChange(clone)
      }
    },
    onHourChange: ({ date, onChange }) => {
      return ({ value }) => {
        const clone = new Date(date.getTime())
        clone.setHours(value)
        onChange(clone)
      }
    },
    onMinuteChange: ({ date, onChange }) => {
      return ({ value }) => {
        const clone = new Date(date.getTime())
        clone.setMinutes(value)
        onChange(clone)
      }
    },
    onMeridiemChange: ({ date, updateMeridiem, onChange }) => {
      return ({ value }) => {
        updateMeridiem(value, () => {
          const hours = date.getHours()
          const clone = new Date(date)

          if (value === 'am' && hours > 11) {
            clone.setHours(hours - 12)
            onChange(clone)
          } else if (value === 'pm' && hours < 12) {
            clone.setHours(hours + 12)
            onChange(clone)
          }
        })
      }
    }
  })
)(({
  date,
  onYearChange,
  onMonthChange,
  onDayChange,
  onHourChange,
  onMinuteChange,
  onMeridiemChange,
  meridiem,
  style
}) => {
  return (
    <div className={css(styles.datePicker)} style={style}>
      <div className={css(styles.date)}>
        <MonthPicker date={date} onChange={onMonthChange} />
        <DayPicker date={date} onChange={onDayChange} />
        <YearPicker date={date} onChange={onYearChange} />
      </div>
      <div className={css(styles.time)}>
        <HourPicker date={date} onChange={onHourChange} meridiem={meridiem} />
        <div className={css(styles.timeSeperator)}>
          :
        </div>
        <MinutePicker date={date} onChange={onMinuteChange} />
        <MeridiemPicker value={meridiem} onChange={onMeridiemChange} />
        <div className={css(styles.timezone)}>
          {date.toTimeString().match(/\(([^)]+)\)/)[1]}
        </div>
      </div>
    </div>
  )
})

const styles = StyleSheet.create({
  datePicker: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  date: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8
  },
  time: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    paddingLeft: 12
  },
  customSelect: {
    marginRight: 8
  },
  year: {
    width: 82
  },
  month: {
    width: 72
  },
  day: {
    width: 60
  },
  hour: {
    width: 54,
    marginRight: 0
  },
  minute: {
    width: 56,
    marginLeft: 0
  },
  meridiem: {
    width: 60,
    marginRight: 8
  },
  timeSeperator: {
    ...font.body1,
    fontWeight: 'bold',
    width: 12,
    textAlign: 'center'
  },
  timeZone: {
    ...font.body1,
    fontWeight: 'bold'
  }
})

export default DatePicker
