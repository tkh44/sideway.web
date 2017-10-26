import { dateToDateString } from 'utils/date'

const StartedDate = ({ className, roomStarted }) => (
  <div className={className}>
    {roomStarted ? dateToDateString(roomStarted) : 'Ended'}
  </div>
)

export default StartedDate
