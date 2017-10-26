import { get, isEmpty } from 'lodash'
import { mapStateDataToArray } from 'redux/nes'
import { emptyRoom } from 'redux/rooms'

const sortRoomsByDate = rooms =>
  rooms.sort((a, b) => b.update.created - a.update.created)

const sortMessagesByDate = (messages = {}) => {
  return Object.keys(messages)
    .map(id => messages[id])
    .sort((a, b) => a.ts - b.ts)
}

export const getRoomById = (state, id) => {
  return state.rooms[id] || { ...emptyRoom }
}

export const pickRoomsFromList = (ids = [], rooms = {}) => {
  return Object.keys(rooms).reduce(
    (accum, key) => {
      if (ids.indexOf(key) > -1) {
        accum[key] = rooms[key]
      }
      return accum
    },
    {}
  )
}

export const isLoaded = room => {
  const { id, title, $$meta: roomMeta } = room

  if (id && title) {
    return true
  }

  const roomLoaded = id &&
    roomMeta &&
    roomMeta.fetching === false &&
    roomMeta.status === 200

  return roomLoaded
}

export const getWriteAccess = (room, profileId) => {
  const isParticipant = userIsActiveParticipant(profileId, room.participants)
  return !!isParticipant &&
    room.access &&
    (room.access === 'write' ||
      room.access === 'admin' ||
      room.access === 'owner')
}

export const getRoomAccessRights = (room, profileId) => {
  return {
    access: room.access,
    isAdmin: room.access === 'admin',
    isOwner: room.access === 'owner',
    canWrite: getWriteAccess(room, profileId)
  }
}

export const getOwner = room => {
  const details = room.owner && room.participants
    ? room.participants[room.owner]
    : {}
  return { id: room.owner, ...details }
}

export const getCreatedAt = room => get(room, 'update.created')

export const getUserActivity = (user, activity) => {
  let userActivity = { pos: 0, hidden: 0, input: '' }

  if (user && activity && activity[user.id]) {
    userActivity = { ...userActivity, ...activity[user.id] }
  }

  return userActivity
}

export const participantsToUsers = (participants = {}, owner) => {
  return Object.keys(participants).reduce(
    (users, id) => {
      const participant = participants[id]
      if (isEmpty(participant)) {
        return users
      }

      const isOwner = id === owner

      if (isOwner) {
        users.unshift({ ...{ id, owner: true }, ...participant })
      } else {
        users.push({ ...{ id, owner: false }, ...participant })
      }

      return users
    },
    []
  )
}

export const userIsActiveParticipant = (profileId, participants) => {
  const p = participants[profileId]
  return p && !p.disabled
}

export const getActiveParticipants = participants => {
  return Object.keys(participants).reduce(
    (accum, key) => {
      const p = participants[key]
      if (p && !p.disabled) {
        accum++
      }
      return accum
    },
    0
  )
}

export const getRoomFull = (participants, limits) => {
  if (!participants) {
    return false
  }

  return getActiveParticipants(participants) >= get(limits, 'participants', 5)
}

export const getJoinRequests = (requests = {}) => {
  return Object.keys(requests).reduce(
    (accum, id) => {
      const message = requests[id]
      if (message !== null) {
        accum.push({ id, message })
      }

      return accum
    },
    []
  )
}

export const getPendingComments = (pending = {}, canWrite, profileId) => {
  return Object.keys(pending).reduce(
    (accum, id) => {
      const pendingComment = pending[id]
      if (pendingComment && (canWrite || pendingComment.user === profileId)) {
        accum.push(pendingComment)
      }
      return accum
    },
    []
  )
}

export const getCurrentUsersPendingComments = (pending = {}, profileId) => {
  return Object.keys(pending).reduce(
    (accum, id) => {
      const pendingComment = pending[id]
      if (pendingComment && pendingComment.user === profileId) {
        accum.push(pendingComment)
      }
      return accum
    },
    []
  )
}

export const shouldShowAddComment = (room, profileId) => {
  const canWrite = getWriteAccess(room, profileId)

  if (canWrite || room.status === 'completed') {
    return false
  }

  if (room.status === 'pending') {
    return true
  }

  const pendingComments = getPendingComments(room.pending, canWrite, profileId)
  return !pendingComments.length
}

export const isCommentQueueFull = ({ status, limits, system }) => {
  if (status === 'completed') {
    return true
  }

  if (status === 'pending') {
    return false
  }

  const pendingLimit = get(limits, 'comments', 5)
  const pendingCount = get(system, 'pending', 0)

  return pendingCount >= pendingLimit
}

export const getMessageUserProfile = (message, participants) => {
  if (participants[message.user]) {
    // When available use the participant data
    return participants[message.user]
  }

  return message.comment ? message.profile : participants[message.user]
}

export const getRoomBlogMode = (messages = {}) => {
  let firstUser

  return Object.keys(messages).every(id => {
    const message = messages[id]

    if (
      message.comment || (firstUser !== undefined && message.user !== firstUser)
    ) {
      return false
    }

    firstUser = message.user
    return true
  })
}

export const groupMessages = (messages = {}, participants = {}, roomActive) => {
  const sortedMessages = sortMessagesByDate(messages).filter(a => !a.deleted)
  const collection = []
  let idx = 0
  let currentCommentId

  for (idx; idx < sortedMessages.length; ++idx) {
    const msg = sortedMessages[idx]
    const prevGroup = collection[collection.length - 1]

    if (msg.comment && msg.reaction !== true) {
      currentCommentId = msg.id
    }

    if (msg.links) {
      if (
        msg.links.length === 1 && msg.links[0] === msg.text.replace(/\s/, '')
      ) {
        msg.linkOnly = true
      }
    }

    if (
      prevGroup && // Is there a previous group
      msg.comment !== true && // not a comment
      prevGroup.comment !== true && // previous group was not a comment group
      msg.user === prevGroup.user.id
    ) {
      // message user id and previous group user id match
      prevGroup.messages.push(msg)
      if (msg.links) {
        const uniqLinks = msg.links.filter(
          link => prevGroup.links.indexOf(link) === -1
        )
        prevGroup.links = prevGroup.links.concat(uniqLinks)
      }
      prevGroup.lastTimestamp = msg.ts
    } else {
      const group = {
        user: {
          id: msg.user,
          ...getMessageUserProfile(msg, participants)
        },
        firstTimestamp: msg.ts,
        lastTimestamp: msg.ts,
        messages: [msg],
        links: Array.isArray(msg.links) ? [].concat(msg.links) : [],
        comment: !!msg.comment,
        reaction: !!msg.reaction,
        system: !!msg.system,
        roomActive
      }

      if (msg.comment && msg.reaction !== true) {
        let commentReplies = []
        for (let j = idx + 1; j < sortedMessages.length; ++j) {
          // scan for the comments replies
          const nextMsg = sortedMessages[j]
          if (nextMsg.comment || nextMsg.system) {
            break
          }
          commentReplies.push(nextMsg.id)
        }
        group.replies = commentReplies
      }

      if (
        currentCommentId &&
        !(msg.comment && msg.reaction !== true) &&
        !msg.system
      ) {
        group.commentContext = currentCommentId
      }

      collection.push(group)
    }
  }

  return collection
}

const splitRoomsByStatus = rooms => {
  return rooms.reduce(
    (split, room) => {
      if (room.status === 'active') {
        split[0].push(room)
      } else if (room.status === 'pending') {
        split[1].push(room)
      } else {
        split[2].push(room)
      }

      return split
    },
    [[], [], []]
  )
}

export const sortRooms = (rooms = []) => {
  const roomsToSort = Array.isArray(rooms) ? rooms : mapStateDataToArray(rooms)

  return splitRoomsByStatus(roomsToSort).map(sortRoomsByDate)
}
