import { connect } from 'react-redux'
import { get } from 'lodash'
import { css, StyleSheet } from 'aphrodite/no-important'
import Tweet from 'ui/Tweet'
// import FacebookShare from 'ui/FacebookShare'
import MediumPublish from 'ui/MediumPublish'
// import AddRoomToCalendar from 'room/AddRoomToCalendar'
import { getRoomById } from 'selectors/rooms'

const twitterHandlesFromParticipants = participants => {
  return Object.keys(participants).reduce(
    (accum, id) => {
      const user = participants[id]
      const handle = get(user, 'networks.twitter')
      if (handle) {
        accum.push(handle)
      }
      return accum
    },
    []
  )
}

const createWithString = handles => {
  if (!handles.length) {
    return ''
  }

  let out = ' with '
  out += handles
    .sort()
    .map((h, i) => i === handles.length - 1 && i !== 0 ? `and @${h}` : `@${h}`)
    .join(' ')
  return out
}

const makeMapStateToProps = (initialState, initialProps) => {
  const roomId = initialProps.roomId

  return state => {
    const room = getRoomById(state, roomId)

    return {
      profile: state.profile,
      room
    }
  }
}

export default connect(makeMapStateToProps)(({ dispatch, profile, room }) => {
  const roomUrl = `${window.sideway.server.short}/${room.id}`
  const twitterHandles = twitterHandlesFromParticipants(room.participants)
  const showMediumPublish = room.status === 'completed' && // room is completed
    profile &&
    profile.id && // logged in and has profile
    get(profile, 'scope', []).some(s => s === 'room:publish') // has 'room:publish' in scope

  return (
    <div className={css(styles.shareWrapper)}>
      <Tweet
        style={{
          padding: 0
        }}
        tweetUrl={roomUrl}
        tweetText={`"${room.title}"${createWithString(twitterHandles)}`}
      />
      {// React.createElement(
      //   FacebookShare,
      //   {
      //     style: {
      //       marginLeft: 8,
      //       padding: 0
      //     },
      //     shareUrl: roomUrl
      //   }
      // ),
      // React.createElement(AddRoomToCalendar, { room, style: { marginLeft: 8 } })
      showMediumPublish &&
        <MediumPublish
          style={{
            marginLeft: 8,
            padding: 0
          }}
          dispatch={dispatch}
          profile={profile}
          room={room}
        />}
    </div>
  )
})

const styles = StyleSheet.create({
  shareWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
