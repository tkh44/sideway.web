import { interpolateHsl } from 'd3-interpolate'

const greenInterpolation = interpolateHsl('#c8efc8', '#0d7a0d')
const GREEN_CACHE = {}

export function getGreenColor (val) {
  if (!GREEN_CACHE[val]) {
    GREEN_CACHE[val] = greenInterpolation(val)
  }

  return GREEN_CACHE[val]
}

export function formatSessionCount (sessionCount) {
  const totalSec = sessionCount * 15
  const d = new Date(totalSec * 1000)
  const hours = d.getUTCHours()
  const minutes = d.getUTCMinutes()

  if (hours === 0) {
    const seconds = d.getUTCSeconds()

    if (minutes < 1) {
      return `${seconds}s`
    } else if (minutes < 10 && seconds !== 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${minutes}m`
    }
  }

  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}
