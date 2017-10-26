import { expect } from 'code'
import Lab from 'lab'
import { createEnv, expectResponse, createUser } from '../test-utils'
import { getRoomById } from 'selectors/rooms'
import reducer, {
    initialState,
    roomActions,
    emptyRoom,
    CREATE_ROOM,
    DELETE_ROOM,
    GET_ROOM,
    SUB_UPDATE
} from 'redux/rooms'

const lab = exports.lab = Lab.script()
const { describe, it } = lab

const fromStore = (store, roomId) => getRoomById(store.getState(), roomId)

const getRoom = async (roomId, store) => {
  const getRes = await store.dispatch(roomActions.getRoomById(roomId))
  expect(getRes.ok).to.be.true()
  const roomFromStorage = fromStore(store, getRes.data.id)
  Object.keys(getRes.data).forEach((key) => {
    expect(getRes.data[key]).to.equal(roomFromStorage[key])
  })

  return roomFromStorage
}

const createAndGetRoom = async (title, store) => {
  const createRes = await store.dispatch(roomActions.createRoom(title))
  expect(createRes.ok).to.be.true()
  const roomId = createRes.data.id
  return await getRoom(roomId, store)
}

const activateRoom = async (roomId, store) => {
  const res = await store.dispatch(roomActions.patchRoom(roomId, { status: 'active' }))
  expect(res.ok).to.be.true()
}

describe('Rooms Redux', () => {
  describe('Room API', () => {
    it('room flow', async (done, onCleanup) => {
      const { appTicket, userTicket, mockStore } = await createEnv(onCleanup)
      const store = mockStore({ auth: { user: userTicket, app: appTicket } })
      await createAndGetRoom('ROOM FLOW ROOM', store)
    })

    it('add participant by id', async (done, onCleanup) => {
      const { server, appTicket, userTicket, mockStore } = await createEnv(onCleanup)
      const store = mockStore({ auth: { user: userTicket, app: appTicket } })
      const room = await createAndGetRoom('Add Participant Room', store)
      const roomId = room.id
      const { profile } = await createUser(server, appTicket)

      const addRes = await store.dispatch(roomActions.addParticipantById(roomId, profile.id))
      expect(addRes.ok).to.be.true()
      const getRes2 = await store.dispatch(roomActions.getRoomById(roomId))
      expect(getRes2.ok).to.be.true()

      const participants = fromStore(store, roomId).participants
      expect(Object.keys(participants)).to.have.length(2)
    })

    it('add participant by username', async (done, onCleanup) => {
      const { server, appTicket, userTicket, mockStore } = await createEnv(onCleanup)
      const store = mockStore({ auth: { user: userTicket, app: appTicket } })
      const room = await createAndGetRoom('Add Participant Room', store)
      const roomId = room.id
      const { profile } = await createUser(server, appTicket)

      const addTwitterRes = await store.dispatch(roomActions.addParticipantByUsername(roomId, profile.networks.twitter.username, 'twitter'))
      expect(addTwitterRes.ok).to.be.true()

      const getRes2 = await store.dispatch(roomActions.getRoomById(roomId))
      expect(getRes2.ok).to.be.true()

      const participants = fromStore(store, roomId).participants
      expect(Object.keys(participants)).to.have.length(2)
    })

    it('set topic', async (done, onCleanup) => {
      const { appTicket, userTicket, mockStore } = await createEnv(onCleanup)
      const store = mockStore({ auth: { user: userTicket, app: appTicket } })
      const room = await createAndGetRoom('Add Participant Room', store)
      const roomId = room.id

      await activateRoom(roomId, store)

      const nextTopic = 'My Topic'
      const res = await store.dispatch(roomActions.putTopic(roomId, nextTopic))
      expect(res.ok).to.be.true()
      const nextRoom = await getRoom(roomId, store)
      expect(nextRoom.system.topic.message).to.equal(nextTopic)
    })

//        it.skip('room comments', (done) => {
//
//            createEnv(async function (server, appTicket, userTicket, emailToken, mockStore) {
//
//                try {
//                    const store = mockStore({ auth: { user: userTicket, app: appTicket } });
//
//                    // create room
//                    const createRes = await store.dispatch(roomActions.createRoom('TESTROOM'));
//                    expect(createRes.ok).to.be.true();
//
//                    // check room exists
//                    const roomId = createRes.data.id;
//                    expect(store.getState().rooms[roomId]).includes(['id', 'title']);
//
//                    // post comment
//                    const postRes1 = await store.dispatch(roomActions.addComment(roomId, 'comment1'));
//                    expect(postRes1.ok).to.be.true();
//
//                    const postRes2 = await store.dispatch(roomActions.addComment(roomId, 'comment2'));
//                    expect(postRes2.ok).to.be.false();
//                    expect(postRes2.status).to.equal(409);
//
//                    const getRes1 = await store.dispatch(roomActions.getComments(roomId));
//                    expect(getRes1.data).includes(['pending']);
//                    expect(store.getState().rooms[roomId].pending[account.id].text).to.equal('comment1');
//
//                    const rejectRes = await store.dispatch(roomActions.rejectComment(roomId, account.id));
//                    expect(rejectRes.ok).to.be.true();
//
//                    await store.dispatch(roomActions.getComments(roomId));
//                    expect(store.getState().rooms[roomId].pending).to.be.empty();
//
//                    const postRes3 = await store.dispatch(roomActions.addComment(roomId, 'comment3'));
//                    expect(postRes3.ok).to.be.true();
//
//                    const acceptRes = await store.dispatch(roomActions.approveComment(roomId, account.id));
//                    expect(acceptRes.ok).to.be.true();
//
//                    const getRes2 = await store.dispatch(roomActions.getComments(roomId));
//                    const data = getRes2.data;
//
//                    Object.keys(data.posted).forEach((commentId) => {
//
//                        expect(store.getState().rooms[roomId].posted[commentId]).to.equal(data.posted[commentId]);
//                    });
//                }
//                catch (err) {
//                    console.error(err);
//                }
//
//                cleanup(done);
//            });
//        });

//        it.skip('room comments (delete process)', (done) => {
//
//            createEnv(async function (server, appTicket, userTicket, emailToken, mockStore) {
//
//                try {
//                    const store = mockStore({ auth: { user: userTicket, app: appTicket } });
//
//                    // create room
//                    const createRes = await store.dispatch(roomActions.createRoom('TESTROOM'));
//                    const roomId = createRes.data.id;
//
//                    // post comment
//                    await store.dispatch(roomActions.addComment(roomId, 'comment1'));
//
//                    // ensure it exists
//                    await store.dispatch(roomActions.getComments(roomId));
//                    expect(store.getState().rooms[roomId].pending[account.id]).to.exist();
//
//                    // delete the pending comment
//                    const pendingDeleteRes = await store.dispatch(roomActions.deletePendingComment(roomId, account.id));
//                    expect(pendingDeleteRes.ok).to.be.true();
//                    expect(store.getState().rooms[roomId].pending[account.id]).to.not.exist();
//
//                    // post comment
//                    await store.dispatch(roomActions.addComment(roomId, 'comment2'));
//
//                    // approve comment
//                    const acceptRes = await store.dispatch(roomActions.approveComment(roomId, account.id));
//                    const commentId = acceptRes.data.id;
//
//                    // check existence
//                    await store.dispatch(roomActions.getComments(roomId));
//                    expect(store.getState().rooms[roomId].posted[commentId]).to.exist();
//
//                    // delete the posted comment
//                    const postedDeleteRes = await store.dispatch(roomActions.deletePostedComment(roomId, commentId));
//                    expect(postedDeleteRes.ok).to.be.true();
//                    expect(store.getState().rooms[roomId].posted[commentId]).to.not.exist();
//
//                    cleanup(done);
//                }
//                catch (err) {
//                    console.log(err);
//                }
//            });
//        });
  })

  describe('State', () => {
    it('should return the initial state', (done) => {
      expect(reducer({}, { type: 'IGNORE_ACTION' })).to.equal(initialState)
      done()
    })

    describe('CREATE_ROOM', () => {
      const createRequest = {
        path: '/room',
        method: 'POST',
        payload: {
          title: 'test'
        }
      }

      it('request', (done) => {
        const newState = reducer(initialState, {
          type: CREATE_ROOM,
          meta: {
            request: createRequest,
            fetching: true
          }
        })

        expect(newState).to.equal(initialState)
        done()
      })

      it('success', (done) => {
        const data = {
          title: 'test',
          public: true,
          active: true,
          messages: [],
          id: 'y'
        }

        const newState = reducer(initialState, {
          type: CREATE_ROOM,
          payload: data,
          meta: { request: createRequest, response: { ok: true }, fetching: false }
        })

        const room = newState[data.id]
        expectResponse(room, false, data)
        done()
      })

      it('error', (done) => {
        const error = { message: 'Failed', data: {} }
        const newState = reducer(initialState, {
          type: CREATE_ROOM,
          payload: error,
          meta: { request: createRequest, response: { ok: false }, fetching: false }
        })

        const room = newState[createRequest.resource]
        expect(room).to.not.exist()
        done()
      })
    })

    describe('DELETE_ROOM', () => {
      const deleteRequest = {
        path: '/room/y',
        method: 'DELETE'
      }

      it('should handle delete room request', (done) => {
        const roomId = 'y'
        const stateWithRoom = {
          ...initialState,
          [roomId]: {
            id: roomId,
            messages: [
              {
                text: 'addd',
                ts: 1234567891011,
                user: '12345'
              }
            ],
            state: {
              '1': {},
              '2': {}
            },
            $$meta: {
              fetching: false,
              error: null
            }
          }
        }

        const newState = reducer(stateWithRoom, {
          type: DELETE_ROOM,
          meta: { request: deleteRequest, response: { ok: true }, fetching: false }
        })

        const expectedSate = {
          ...stateWithRoom,
          [roomId]: emptyRoom
        }

        expect(newState).to.equal(expectedSate)

        done()
      })
    })

    describe('GET_ROOM', () => {
      const getRequest = {
        path: '/room/y',
        method: 'GET'
      }

      it('should handle get room request', (done) => {
        const newState = reducer(initialState, {
          type: GET_ROOM,
          meta: { request: getRequest, fetching: true }
        })

        const room = newState.y
        expectResponse(room, true)
        done()
      })

      it('should handle get room response success', (done) => {
        const data = {
          ...emptyRoom,
          title: 'test',
          public: true,
          active: true,
          messages: [],
          id: 'y'
        }
        const newState = reducer(initialState, {
          type: GET_ROOM,
          payload: data,
          meta: { request: getRequest, response: { ok: true }, fetching: false }
        })

        const room = newState[data.id]
        expectResponse(room, false, data)
        done()
      })

      it('should handle get room response error', (done) => {
        const error = { message: 'Failed', data: {} }
        const newState = reducer(initialState, {
          type: GET_ROOM,
          payload: error,
          meta: { request: getRequest, response: { ok: false }, fetching: false }
        })

        const room = newState.y
        expectResponse(room, false, null, true)
        done()
      })
    })

    describe('SUB_UPDATE', () => {
      it('should handle adding message', (done) => {
        const payload = {
          message: {
            id: 'B',
            messages: {
              '1': {
                text: 'addd',
                ts: 1234567891011,
                user: '12345',
                id: '1'
              }
            }
          },
          path: '/room/B'
        }
        const newState = reducer(initialState, {
          type: SUB_UPDATE,
          payload
        })

        const room = newState[payload.message.id]
        expect(room.messages).to.equal(payload.message.messages)
        done()
      })

      it('should handle updating room state', (done) => {
        const state = {
          '12345': {
            input: 'abcdef',
            status: 'typing'
          }
        }

        const subscriptionMessage = {
          id: 'B',
          state
        }

        const newState = reducer(initialState, {
          type: SUB_UPDATE,
          payload: {
            message: subscriptionMessage,
            path: '/room/B'
          }
        })

        const room = newState[subscriptionMessage.id]
        expect(room.state).to.equal(state)
        done()
      })

      it('should update state on room with data and no state', (done) => {
        const roomId = 'y'
        const stateWithRoom = {
          ...initialState,
          [roomId]: {
            data: { id: roomId, messages: {} },
            fetching: false,
            error: null
          }
        }

        const messageRoomState = { '12345': { input: 'message1', status: 'typing' } }
        const newState = reducer(stateWithRoom, {
          type: SUB_UPDATE,
          payload: {
            message: {
              id: roomId,
              state: messageRoomState
            }
          }
        })

        const updatedRoom = newState[roomId]
        expect(updatedRoom.state).to.equal(messageRoomState)
        done()
      })

      it('should update existing room state', (done) => {
        const roomId = 'y'
        const message1 = { id: '1', text: 'message1', ts: 1234567891011, user: '12345' }
        const message2 = { id: '2', text: 'message2', ts: 1234567891024, user: '54321' }

        const state1 = {
          '12345': { input: 'message1', status: 'typing', pos: 0, hidden: 0 },
          '54321': { input: '', status: 'idle', pos: 0, hidden: 0 }
        }

        const state2 = {
          '12345': { input: '', status: 'idle', pos: 4, hidden: 2 },
          '54321': { input: 'message2', status: 'typing', pos: 8, hidden: 4 }
        }

        const stateWithRoom = {
          ...initialState,
          [roomId]: {
            id: roomId,
            messages: { '1': message1 },
            state: state1,
            $$meta: {
              fetching: false,
              error: null
            }
          }
        }

        const newState = reducer(stateWithRoom, {
          type: SUB_UPDATE,
          payload: {
            message: {
              id: roomId,
              messages: { '2': message2 },
              state: state2
            },
            path: '/room/y',
            resource: roomId
          }
        })

        const updatedRoom = newState[roomId]
        expect(updatedRoom.messages).to.equal({ '1': message1, '2': message2 })
        expect(updatedRoom.state).to.equal({ ...state1, ...state2 })
        done()
      })

      it('should not clear out properties on partial update', (done) => {
        const roomId = 'y'
        const message1 = { id: '1', text: 'message1', ts: 1234567891011, user: '12345' }
        const message2 = { id: '2', text: 'message2', ts: 1234567891024, user: '54321' }

        const state1 = {
          '12345': { input: 'message1', status: 'typing' },
          '54321': { input: '', status: 'idle' }
        }

        const state2 = {
          '12345': { input: '', status: 'idle' },
          '54321': { input: 'message2', status: 'typing' }
        }

        const stateWithRoom = {
          ...initialState,
          [roomId]: {
            id: roomId,
            messages: { '1': message1 },
            state: state1,
            $$meta: {
              fetching: false,
              error: null
            }
          }
        }

        const newState = reducer(stateWithRoom, {
          type: SUB_UPDATE,
          payload: {
            message: {
              id: roomId,
              messages: { '2': message2 },
              state: state2
            },
            path: '/room/y',
            resource: roomId
          }
        })

        const updatedRoom = newState[roomId]
        expect(updatedRoom.messages).to.equal({ '1': message1, '2': message2 })
        expect(updatedRoom.state).to.equal({ ...state1, ...state2 })
        done()
      })

      it('should update participants', (done) => {
        const roomId = 'y'
        const message1 = { id: '1', text: 'message1', ts: 1234567891011, user: '12345' }
        const message2 = { id: '2', text: 'message2', ts: 1234567891024, user: '54321' }

        const state1 = {
          '12345': { input: 'message1', status: 'typing' },
          '54321': { input: '', status: 'idle' },
          '67890': { input: '', status: 'idle' }
        }

        const state2 = {
          '12345': { input: '', status: 'idle' },
          '54321': { input: 'message2', status: 'typing' },
          '67890': null
        }

        const stateWithRoom = {
          ...initialState,
          [roomId]: {
            id: roomId,
            messages: { '1': message1 },
            participants: {
              '12345': true
            },
            state: state1,
            $$meta: {
              fetching: false,
              error: null
            }
          }
        }

        const participant1 = { name: 'bob', id: '12345' }
        const participant2 = { name: 'dan', id: '54321' }

        const newState = reducer(stateWithRoom, {
          type: SUB_UPDATE,
          payload: {
            message: {
              id: roomId,
              messages: { '2': message2 },
              state: state2,
              participants: {
                '12345': participant1,
                '54321': participant2
              }
            },
            path: '/room/y',
            resource: roomId
          }
        })

        const updatedRoom = newState[roomId]
        expect(updatedRoom.messages).to.equal({ '1': message1, '2': message2 })
        expect(updatedRoom.state).to.equal({ ...state1, ...state2 })
        expect(updatedRoom.participants).to.equal({
          '12345': participant1,
          '54321': participant2
        })
        done()
      })

      it('accepts partial participant updates', (done) => {
        const roomId = 'y'
        const participant1 = { name: 'bob', id: '12345' }
        const participant2 = { name: 'dan', id: '54321' }
        const message1 = { id: '1', text: 'message1', ts: 1234567891011, user: '12345' }
        const message2 = { id: '2', text: 'message2', ts: 1234567891024, user: '54321' }

        const state1 = {
          [participant1.id]: { input: 'message1', status: 'typing' }
        }

        const state2 = {
          [participant2.id]: { input: 'message2', status: 'typing' }
        }

        const stateWithRoom = {
          ...initialState,
          [roomId]: {
            id: roomId,
            messages: { '1': message1 },
            participants: {
              [participant1.id]: participant1
            },
            state: state1,
            $$meta: {
              fetching: false,
              error: null
            }
          }
        }

        const newState = reducer(stateWithRoom, {
          type: SUB_UPDATE,
          payload: {
            message: {
              id: roomId,
              messages: { '2': message2 },
              state: state2,
              participants: {
                [participant2.id]: participant2
              }
            },
            path: '/room/y',
            resource: roomId
          }
        })

        const updatedRoom = newState[roomId]
        expect(updatedRoom.messages).to.equal({ '1': message1, '2': message2 })
        expect(updatedRoom.state).to.equal({ ...state1, ...state2 })
        expect(updatedRoom.participants).to.equal({
          [participant1.id]: participant1,
          [participant2.id]: participant2
        })
        done()
      })

      it('participant disabled updates', (done) => {
        const roomId = 'y'
        const participant1 = { name: 'bob', id: '12345', disabled: false }
        const participant2 = { name: 'dan', id: '54321', disabled: true }

        const stateWithRoom = {
          ...initialState,
          [roomId]: {
            id: roomId,
            participants: {
              [participant1.id]: participant1,
              [participant2.id]: participant2
            }
          }
        }

        const newState = reducer(stateWithRoom, {
          type: SUB_UPDATE,
          payload: {
            message: {
              id: roomId,
              participants: {
                [participant1.id]: { ...participant1, disabled: true },
                [participant2.id]: { ...participant2, disabled: false }
              }
            }
          }
        })

        const updatedRoom = newState[roomId]
        expect(updatedRoom.participants).to.equal({
          [participant1.id]: { ...participant1, disabled: true },
          [participant2.id]: { ...participant2, disabled: false }
        })
        done()
      })

      it('updates requests', (done) => {
        const roomId = 'y'
        const message1 = { id: '1', text: 'message1', ts: 1234567891011, user: '12345' }
        const message2 = { id: '2', text: 'message2', ts: 1234567891024, user: '54321' }

        const state1 = {
          '12345': { input: 'message1', status: 'typing', pos: 0, hidden: 0 },
          '54321': { input: '', status: 'idle', pos: 0, hidden: 0 }
        }

        const state2 = {
          '12345': { input: '', status: 'idle', pos: 4, hidden: 2 },
          '54321': { input: 'message2', status: 'typing', pos: 8, hidden: 4 }
        }

        const stateWithRoom = {
          ...initialState,
          [roomId]: {
            id: roomId,
            messages: { '1': message1 },
            state: state1,
            requests: {},
            $$meta: {
              fetching: false,
              error: null
            }
          }
        }

        const newState = reducer(stateWithRoom, {
          type: SUB_UPDATE,
          payload: {
            message: {
              id: roomId,
              messages: { '2': message2 },
              state: state2
            },
            path: '/room/y',
            resource: roomId
          }
        })

        const updatedRoom = newState[roomId]
        expect(updatedRoom.messages).to.equal({ '1': message1, '2': message2 })
        expect(updatedRoom.state).to.equal({ ...state1, ...state2 })
        done()
      })

      it('updates audience count', (done) => {
        const roomId = 'y'

        const stateWithRoom = {
          ...initialState,
          [roomId]: {

            system: {
              audience: 1,
              peak: 1
            }
          }
        }

        const newState = reducer(stateWithRoom, {
          type: SUB_UPDATE,
          payload: {
            message: {
              id: roomId,
              system: {
                audience: 2,
                peak: 2
              }
            }
          }
        })

        const updatedRoom = newState[roomId]
        expect(updatedRoom.system).to.equal({ audience: 2, peak: 2 })
        done()
      })

      it('updates links array -> null -> []', (done) => {
        const roomId = 'y'

        const stateWithRoom = {
          ...initialState,
          [roomId]: {
            links: null
          }
        }

        const newState = reducer(stateWithRoom, {
          type: SUB_UPDATE,
          payload: {
            message: {
              id: roomId,
              links: null
            }
          }
        })

        const updatedRoom = newState[roomId]
        expect(updatedRoom.links).to.equal([])
        done()
      })

      it('updates links null -> array -> array', (done) => {
        const roomId = 'y'

        const stateWithRoom = {
          ...initialState,
          [roomId]: {
            links: null
          }
        }

        const newState = reducer(stateWithRoom, {
          type: SUB_UPDATE,
          payload: {
            message: {
              id: roomId,
              links: ['www.google.com', 'www.sideway.com']
            }
          }
        })

        const updatedRoom = newState[roomId]
        expect(updatedRoom.links).to.equal(['www.google.com', 'www.sideway.com'])
        done()
      })

      it('updates links array -> object -> array', (done) => {
        const roomId = 'y'

        const stateWithRoom = {
          ...initialState,
          [roomId]: {
            links: ['www.google.com']
          }
        }

        const newState = reducer(stateWithRoom, {
          type: SUB_UPDATE,
          payload: {
            message: {
              id: roomId,
              links: { 0: 'www.sideway.com' }
            }
          }
        })

        const updatedRoom = newState[roomId]
        expect(updatedRoom.links).to.equal(['www.sideway.com'])
        done()
      })
    })
  })
})
