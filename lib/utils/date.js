const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

export const getMonthName = date => {
  return monthNames[date.getUTCMonth()]
}

export const getTimeDeltaInMinSec = ms => {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)

  return {
    seconds: s - m / 60,
    minutes: m
  }
}

export const msToMin = ms => Math.floor(ms / 60000)

export const minToMs = min => 60000 * min

export const dateToIcalFormat = date => {
  const d = new Date(date)
  return d.toISOString().replace(/-|:/g, '').slice(0, 13).concat('00Z')
}

export const dateToString = date =>
  new Date(date).toLocaleString([], {
    timeZoneName: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  })

export const dateToDateString = date =>
  new Date(date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

export const dateToTimeString = date =>
  new Date(date).toLocaleTimeString([], {
    hour: 'numeric',
    minute: 'numeric'
  })

const createUnitWithSuffix = (unit, value) => {
  return `${unit}${value === 1 ? '' : 's'}`
}

const roundSeconds = value => {
  if (value < 15) {
    return 1
  } else if (value >= 15 && value < 30) {
    return 15
  } else if (value >= 30 && value < 45) {
    return 30
  } else if (value >= 45 && value < 60) {
    return 45
  }

  return 0
}

export const timeAgoFormatter = (value, unit, suffix, date) => {
  const formattedValue = unit === 'second' || unit === 'seconds'
    ? roundSeconds(value)
    : value

  if (
    suffix === 'from now' ||
    (formattedValue === 1 && (unit === 'second' || unit === 'seconds'))
  ) {
    return '1 second ago'
  }

  return `${formattedValue} ${createUnitWithSuffix(unit, formattedValue)} ${suffix}`
}
