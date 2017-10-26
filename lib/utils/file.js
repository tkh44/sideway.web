import removeMarkdown from 'remove-markdown'
import { dateToIcalFormat } from 'utils/date'

export const createTextFile = (text, filetype = 'text/plain') =>
  new window.Blob([text], { type: filetype })

export const makeRoomCalEvent = room => {
  const owner = room.participants[room.owner]
  const participantString = Object.keys(room.participants).reduce(
    (out, id) => {
      const user = room.participants[id]
      out += `ATTENDEE;CN=${user.display};RSVP=TRUE:MAILTO:\n`
      return out
    },
    ''
  )

  const text = `
    BEGIN:VCALENDAR
    VERSION:2.0
    BEGIN:VEVENT
    DTSTAMP:${dateToIcalFormat(new Date())}
    ORGANIZER;CN=${owner.display}:MAILTO:
    ${participantString || ''}
    DTSTART:${dateToIcalFormat(room.time)}
    SUMMARY:${room.title}
    DESCRIPTION:${removeMarkdown(room.description)}
    URL:${window.sideway.server.short}/${room.id}
    END:VEVENT
    END:VCALENDAR
  `
    .split('\n')
    .map(line => line.trim())
    .join('\n')

  return createTextFile(text, 'text/calendar')
}
