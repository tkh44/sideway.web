import withPropsOnChange from 'recompose/withPropsOnChange'
import { groupMessages } from 'selectors/rooms'

export default withPropsOnChange(['room'], ({ room }) => {
  const grouped = groupMessages(
    room.messages,
    room.participants,
    room.status === 'active'
  )

  const messageData = grouped.reduce(
    (accum, group) => {
      return accum.concat(
        group.messages.map(m => {
          return {
            ...m,
            user: group.user
          }
        })
      )
    },
    []
  )

  return { messageData }
})
