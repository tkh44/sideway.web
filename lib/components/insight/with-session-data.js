import { get } from 'lodash'
import withPropsOnChange from 'recompose/withPropsOnChange'
import { mean, median } from 'd3-array'

export default function withSessionData () {
  return withPropsOnChange(['insightData'], ({ insightData }) => {
    const sessions = get(insightData, 'sessions', {})
    const referrers = get(insightData, 'referrers', {})
    const timestamps = Object.keys(sessions)
      .map(ts => parseInt(ts, 10))
      .sort((a, b) => b - a)
    let maxViewers = 0
    let maxSession = 0
    const sessionCounts = []
    const viewerData = []
    const sessionData = []
    let limit = timestamps.length

    // This is overcomplicated to accommodate slicing data later
    console.time('sessionData')
    while (--limit >= 0) {
      const ts = timestamps[limit]
      const sessionMap = sessions[ts]
      const sortedLengths = Object.keys(sessionMap).sort(
        (a, b) => parseInt(a, 10) - parseInt(b, 10)
      )
      let viewerSum = 0

      const baseData = sortedLengths.map((length, i) => {
        const viewers = sessionMap[length]
        const count = parseInt(length, 10)

        for (let i = 0; i < viewers; ++i) {
          sessionCounts.push(count)
        }

        const point = {
          viewers,
          count
        }

        viewerSum += viewers
        maxSession = Math.max(count, maxSession)
        return point
      })

      viewerData.push({ ts, viewers: viewerSum })
      maxViewers = Math.max(viewerSum, maxViewers)
      sessionData.push({
        ts,
        viewerTotal: viewerSum,
        stops: baseData.map(({ viewers, count }) => ({
          offset: viewers / viewerSum,
          viewers,
          viewerSum,
          sessionLength: count
        }))
      })
    }
    console.timeEnd('sessionData')
    return {
      avgViewers: mean(viewerData, ({ viewers }) => viewers),
      firstSessionTimestamp: timestamps[0],
      lastSessionTimestamp: timestamps[timestamps.length - 1],
      maxSession: maxSession,
      maxViewers,
      medianSession: median(sessionCounts),
      referrers,
      sessionData,
      timestamps,
      viewerData: viewerData
    }
  })
}
