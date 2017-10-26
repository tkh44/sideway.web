import { expect } from 'code'
import Lab from 'lab'
import { createEnv, createUser } from '../test-utils'
import { profileActions } from 'redux/profile'
import { roomActions } from 'redux/rooms'
import {
  getRoomAccessRights,
  getRoomBlogMode,
  getRoomById,
  getRoomFull,
  getUserActivity,
  getWriteAccess,
  groupMessages,
  isCommentQueueFull,
  isLoaded,
  participantsToUsers,
  pickRoomsFromList,
  shouldShowAddComment,
  sortRooms
} from 'selectors/rooms'

const lab = (exports.lab = Lab.script())
const { describe, it } = lab

describe('Room Selectors', () => {
  it('getters', async (done, onCleanup) => {
    const { appTicket, userTicket, mockStore } = await createEnv(onCleanup)
    const store = mockStore({ auth: { user: userTicket, app: appTicket } })

    const createRes = await store.dispatch(roomActions.createRoom('TESTROOM'))
    expect(createRes.ok).to.be.true()
    const roomId = createRes.data.id
    expect(store.getState().rooms[roomId]).includes(['id', 'title'])

    const getRes = await store.dispatch(roomActions.getRoomById(roomId))
    expect(getRes.data).includes(['id', 'title'])
    expect(getRes.data.title).to.equal('TESTROOM')

    const room = getRoomById(store.getState(), roomId)
    expect(room.title).to.equal('TESTROOM')

    const profileRes = await store.dispatch(profileActions.getProfile())
    expect(profileRes.ok).to.be.true()
    const profile = store.getState().profile

    expect(isLoaded(room)).to.be.true()
    expect(getWriteAccess(room, profile.id)).to.be.true()
    expect(getRoomAccessRights(room, profile.id)).to.equal({
      access: 'owner',
      canWrite: true,
      isAdmin: false,
      isOwner: true
    })
    expect(getUserActivity(profile, room)).to.equal({
      pos: 0,
      hidden: 0,
      input: ''
    })
    expect(getRoomFull(room.participants, room.limits)).to.be.false()
  })

  it('pickRoomsFromList', done => {
    const ids = ['1', '3']
    const rooms = { 1: {}, 2: {}, 3: {} }
    expect(pickRoomsFromList(ids, rooms)).to.equal({ 1: {}, 3: {} })
    done()
  })

  it('isCommentQueueFull', done => {
    expect(
      isCommentQueueFull({
        status: 'pending',
        limits: { comments: 5 },
        system: { pending: 0 }
      })
    ).to.be.false()
    expect(
      isCommentQueueFull({
        status: 'pending',
        limits: { comments: 5 },
        system: { pending: 10 }
      })
    ).to.be.false()
    expect(
      isCommentQueueFull({
        status: 'completed',
        limits: { comments: 5 },
        system: { pending: 0 }
      })
    ).to.be.true()
    expect(
      isCommentQueueFull({
        status: 'active',
        limits: { comments: 5 },
        system: { pending: 0 }
      })
    ).to.be.false()
    expect(
      isCommentQueueFull({
        status: 'active',
        limits: { comments: 5 },
        system: { pending: 5 }
      })
    ).to.be.true()
    expect(
      isCommentQueueFull({
        status: 'active',
        limits: { comments: 5 },
        system: { pending: 4 }
      })
    ).to.be.false()
    expect(
      isCommentQueueFull({
        status: 'active',
        limits: { comments: 10 },
        system: { pending: 5 }
      })
    ).to.be.false()
    done()
  })

  it('shouldShowAddComment', done => {
    expect(
      shouldShowAddComment(
        { access: 'write', status: 'active', participants: { 1: {} } },
        '1'
      )
    ).to.be.false()

    expect(
      shouldShowAddComment(
        { access: 'admin', status: 'active', participants: { 1: {} } },
        '1'
      )
    ).to.be.false()

    expect(
      shouldShowAddComment(
        { access: 'admin', status: 'active', participants: { 2: {} } },
        '1'
      )
    ).to.be.true()

    expect(
      shouldShowAddComment(
        { access: 'read', status: 'completed', participants: { 1: {} } },
        '1'
      )
    ).to.be.false()

    expect(
      shouldShowAddComment(
        { access: 'read', status: 'pending', participants: { 1: {} } },
        '1'
      )
    ).to.be.true()

    expect(
      shouldShowAddComment(
        {
          access: 'read',
          status: 'pending',
          participants: { 1: {} },
          pending: {
            '1': {
              user: '1'
            }
          }
        },
        '1'
      )
    ).to.be.true()

    expect(
      shouldShowAddComment(
        {
          access: 'read',
          status: 'active',
          participants: { 1: {} },
          pending: {
            '1': {
              user: '2'
            }
          }
        },
        '1'
      )
    ).to.be.true()

    expect(
      shouldShowAddComment(
        {
          access: 'read',
          status: 'active',
          participants: { 1: {} },
          pending: {
            '1': {
              user: '1'
            }
          }
        },
        '1'
      )
    ).to.be.false()

    done()
  })

  describe('participants', () => {
    it('converts participants to user array', async (done, onCleanup) => {
      const { server, appTicket, userTicket, mockStore } = await createEnv(
        onCleanup
      )
      const store = mockStore({ auth: { user: userTicket, app: appTicket } })

      const createRes = await store.dispatch(
        roomActions.createRoom('TESTROOM')
      )
      expect(createRes.ok).to.be.true()

      const roomId = createRes.data.id
      const getRes = await store.dispatch(roomActions.getRoomById(roomId))
      expect(getRes.ok).to.be.true()

      const getRoom = () => getRoomById(store.getState(), roomId)
      const { profile } = await createUser(server, appTicket)

      const room1 = getRoom()
      expect(
        participantsToUsers(room1.participants, room1.owner)
      ).to.have.length(1)

      const addRes = await store.dispatch(
        roomActions.addParticipantById(roomId, profile.id)
      )
      expect(addRes.ok).to.be.true()
      const getRes2 = await store.dispatch(roomActions.getRoomById(roomId))
      expect(getRes2.ok).to.be.true()

      const room2 = getRoom()
      const participants = participantsToUsers(room2.participants, room2.owner)
      expect(participants).to.have.length(2)
    })

    it('getRoomBlogMode', done => {
      const user1 = 'user-1-id'
      const user2 = 'user-2-id'
      const messages1 = {
        '1': { text: '1a', ts: 1, user: user1, id: '1' },
        '2': { text: '1b', ts: 2, user: user1, id: '2' },
        '4': { text: '2a', ts: 4, user: user2, id: '4' }
      }

      expect(getRoomBlogMode(messages1)).to.be.false()

      const messages2 = {
        '1': { text: '1a', ts: 1, user: user1, id: '1' },
        '2': { text: '1b', ts: 2, user: user1, id: '2' },
        '9': { text: '1c', ts: 9, user: user1, id: '9' },
        '10': { text: '1d', ts: 10, user: user1, id: '10' },
        '12': { text: '1e', ts: 12, user: user1, id: '12' }
      }

      expect(getRoomBlogMode(messages2)).to.be.true()

      const messages3 = {
        '1': { text: '1a', ts: 1, user: user1, id: '1' },
        '2': { text: '1b', ts: 2, user: user1, id: '2' },
        '3': {
          text: 'comment 1',
          ts: 3,
          user: user1,
          comment: true,
          id: 'comment-id-1'
        },
        '9': { text: '1c', ts: 9, user: user1, id: '9' },
        '10': { text: '1d', ts: 10, user: user1, id: '10' },
        '12': { text: '1e', ts: 12, user: user1, id: '12' }
      }

      expect(getRoomBlogMode(messages3)).to.be.false()

      done()
    })
  })

  describe('group messages', () => {
    it('groups', done => {
      const user1 = 'user-1-id'
      const user2 = 'user-2-id'
      const user3 = 'user-3-id'
      const participants = {
        [user1]: { id: user1 },
        [user2]: { id: user2 },
        [user3]: { id: user3 }
      }
      const messages = {
        '1': { text: '1a', ts: 1, user: user1, id: '1' },
        '2': { text: '1b', ts: 2, user: user1, id: '2' },
        '3': { text: 'comment 1', ts: 3, user: user3, comment: true, id: '3' },
        '4': { text: '2a', ts: 4, user: user2, id: '4' },
        '5': { text: '2b', ts: 5, user: user2, id: '5' },
        '6': { text: '2c', ts: 6, user: user2, id: '6' },
        '7': { text: 'comment 2', ts: 7, user: user3, comment: true, id: '7' },
        '8': { text: 'comment 3', ts: 8, user: user3, comment: true, id: '8' },
        '9': { text: '1c', ts: 9, user: user1, id: '9' },
        '10': { text: '1d', ts: 10, user: user1, id: '10' },
        '11': {
          text: 'comment 4',
          ts: 11,
          user: user3,
          comment: true,
          id: '11'
        },
        '12': { text: '1e', ts: 12, user: user1, id: '12' }
      }

      expect(groupMessages(messages, participants, true)).to.equal([
        {
          messages: [messages['1'], messages['2']],
          roomActive: true,
          firstTimestamp: messages['1'].ts,
          lastTimestamp: messages['2'].ts,
          user: participants[user1],
          comment: false,
          reaction: false,
          system: false,
          links: []
        },
        {
          messages: [messages['3']],
          roomActive: true,
          firstTimestamp: messages['3'].ts,
          lastTimestamp: messages['3'].ts,
          user: { id: user3 },
          comment: true,
          reaction: false,
          replies: ['4', '5', '6'],
          system: false,
          links: []
        },
        {
          messages: [messages['4'], messages['5'], messages['6']],
          roomActive: true,
          firstTimestamp: messages['4'].ts,
          lastTimestamp: messages['6'].ts,
          user: participants[user2],
          comment: false,
          reaction: false,
          commentContext: '3',
          system: false,
          links: []
        },
        {
          messages: [messages['7']],
          roomActive: true,
          firstTimestamp: messages['7'].ts,
          lastTimestamp: messages['7'].ts,
          user: { id: user3 },
          comment: true,
          reaction: false,
          replies: [],
          system: false,
          links: []
        },
        {
          messages: [messages['8']],
          roomActive: true,
          firstTimestamp: messages['8'].ts,
          lastTimestamp: messages['8'].ts,
          user: { id: user3 },
          comment: true,
          reaction: false,
          replies: ['9', '10'],
          system: false,
          links: []
        },
        {
          messages: [messages['9'], messages['10']],
          roomActive: true,
          firstTimestamp: messages['9'].ts,
          lastTimestamp: messages['10'].ts,
          user: participants[user1],
          comment: false,
          reaction: false,
          commentContext: '8',
          system: false,
          links: []
        },
        {
          messages: [messages['11']],
          roomActive: true,
          firstTimestamp: messages['11'].ts,
          lastTimestamp: messages['11'].ts,
          user: { id: user3 },
          comment: true,
          reaction: false,
          replies: ['12'],
          system: false,
          links: []
        },
        {
          messages: [messages['12']],
          roomActive: true,
          firstTimestamp: messages['12'].ts,
          lastTimestamp: messages['12'].ts,
          user: participants[user1],
          comment: false,
          reaction: false,
          commentContext: '11',
          system: false,
          links: []
        }
      ])

      done()
    })
  })

  describe('sort rooms', () => {
    it('sorts rooms from state (object)', done => {
      const rooms = [
        { id: 'a', status: 'pending', update: { created: 4 } },
        { id: 'b', status: 'active', update: { created: 3 } },
        { id: 'd', status: 'active', update: { created: 2 } },
        { id: 'c', status: 'pending', update: { created: 1 } }
      ]

      const state = {
        rooms: rooms.reduce(
          (accum, room) => {
            accum[room.id] = room
            return accum
          },
          {}
        )
      }

      expect(sortRooms(state.rooms)).to.equal([
        [
          { id: 'b', status: 'active', update: { created: 3 } },
          { id: 'd', status: 'active', update: { created: 2 } }
        ],
        [
          { id: 'a', status: 'pending', update: { created: 4 } },
          { id: 'c', status: 'pending', update: { created: 1 } }
        ],
        []
      ])
      done()
    })

    it('sorts rooms from list (array)', done => {
      const rooms = [
        { id: 'a', status: 'pending', update: { created: 4 } },
        { id: 'b', status: 'active', update: { created: 3 } },
        { id: 'd', status: 'active', update: { created: 2 } },
        { id: 'c', status: 'completed', update: { created: 1 } }
      ]

      expect(sortRooms(rooms)).to.equal([
        [
          { id: 'b', status: 'active', update: { created: 3 } },
          { id: 'd', status: 'active', update: { created: 2 } }
        ],
        [{ id: 'a', status: 'pending', update: { created: 4 } }],
        [{ id: 'c', status: 'completed', update: { created: 1 } }]
      ])
      done()
    })
  })
})
