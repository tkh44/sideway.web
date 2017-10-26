import Stat from 'ui/Stat'
import { formatSessionCount } from 'utils/charts'

export default function AudienceStatsContainer (
  { avgViewers, className, maxViewers, medianSession, maxSession }
) {
  return (
    <div className={className}>
      <Stat value={Math.round(avgViewers)} label='Avg Viewers' />
      <Stat value={Math.round(maxViewers)} label='Max Viewers' />
      <Stat value={formatSessionCount(medianSession)} label='Median Session' />
      <Stat value={formatSessionCount(maxSession)} label='Longest Session' />
    </div>
  )
}
