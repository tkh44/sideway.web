import { get } from 'lodash'
import withPropsOnChange from 'recompose/withPropsOnChange'

export default function withReferrerData () {
  return withPropsOnChange(['insightData'], ({ insightData }) => {
    const sessions = get(insightData, 'sessions', {})
    const referrers = get(insightData, 'referrers', {})
    const referrerData = []

    const getViewerCountForTimestamp = ts => {
      let sum = 0
      for (let c in sessions[ts]) {
        sum += sessions[ts][c]
      }
      return sum
    }

    for (let ts in referrers) {
      const timestamp = parseInt(ts, 10)

      referrerData.push({
        ts: timestamp,
        viewers: getViewerCountForTimestamp(timestamp)
      })
    }

    return { referrerData: referrerData.sort((a, b) => b.ts - a.ts) }
  })
}
