import { expect } from 'code'
import Lab from 'lab'
import { createEnv } from '../test-utils'
import { roomActions, SUB_UPDATE } from 'redux/rooms'
import { authActions } from 'redux/auth'
import {
  actions as nesActions,
  initialState,
  nesReducer,
  CONNECT,
  CONNECT_SUCCESS,
  CONNECT_ERROR,
  DISCONNECT,
  QUEUE_ADD,
  FLUSH_QUEUE
} from 'redux/nes'

const lab = exports.lab = Lab.script()
const { describe, it } = lab

describe('Redux Nes', () => {
  describe('Actions', () => {
    it('connects with appTicket', (done, onCleanup) => {
      createEnv(onCleanup).then(({ server, appTicket, userTicket, emailToken, mockStore }) => {
        const store = mockStore({ auth: { app: appTicket } })

        expect(store.getState().nes.connected).to.be.false()

        store.dispatch(nesActions.connect(appTicket))
          .then((connectTicket) => {
            expect(connectTicket).to.equal(appTicket)
            expect(store.getState().nes.connected).to.be.true()
            done()
          })
      })
    })

    it('handles invalid appTicket', async (done, onCleanup) => {
      const { mockStore } = await createEnv(onCleanup)
      const store = mockStore()

      const badAppTicket = {
        exp: 1462156592519,
        app: 'sideway.blah',
        scope: [],
        key: ' BAD_KEY',
        algorithm: 'sha256',
        id: 'Fe26.2'
      }

      try {
        await store.dispatch(nesActions.connect(badAppTicket))
      } catch (err) {
        expect(err.statusCode).to.equal(401)
      }
    })

    it('makes unauthorized request with app ticket', (done, onCleanup) => {
      createEnv(onCleanup).then(({ appTicket, mockStore }) => {
        const store = mockStore()
        store.dispatch(nesActions.connect(appTicket)).then(() => {
          store.dispatch(nesActions.request('/user/lookup/username/fooman', 'test/REQUEST', (err, res) => {
            expect(res).to.not.exist()
            expect(err.statusCode).to.equal(404)
            done()
          }))
        })
      })
    })

    it('connects with userTicket', async (done, onCleanup) => {
      const { mockStore, userTicket } = await createEnv(onCleanup)
      const store = mockStore()

      const connectTicket = await store.dispatch(nesActions.connect(userTicket))
      expect(connectTicket).to.equal(userTicket)
      expect(store.getState().nes.connected).to.be.true()
    })

    it('connects when auth changes', (done, onCleanup) => {
      createEnv(onCleanup).then(({ server, appTicket, userTicket, emailToken, mockStore }) => {
        const appTicketKeys = Object.keys(appTicket)
        const userTicketKeys = Object.keys(userTicket)

        const testConnectionMiddlware = (store) => {
          return (next) => {
            return (action) => {
              // CONNECT_SUCCESS should occur once for the connection with app ticket and once for user ticket.
              if (action.type === CONNECT_SUCCESS) {
                done()
              }

              return next(action)
            }
          }
        }

        const store = mockStore({ auth: { app: appTicket } }, testConnectionMiddlware)

        // Connect with app ticket
        store.dispatch(nesActions.connect(appTicket)).then((connectTicket1) => {
          expect(connectTicket1).to.only.include(appTicketKeys)

          // Get fresh rsvp
          store.dispatch(authActions.email(emailToken)).then(({ data: { rsvp } }) => {
            // Authorize with fresh rsvp
            store.dispatch(authActions.getUserTicket(rsvp)).then(() => {
              expect(store.getState().auth.user).to.only.include(userTicketKeys)
            })
          })
        })
      })
    })

    it('makes authorized request with user ticket', (done, onCleanup) => {
      createEnv(onCleanup).then(({ userTicket, mockStore }) => {
        const store = mockStore()
        store.dispatch(nesActions.connect(userTicket)).then(() => {
          store.dispatch(nesActions.request('/user', 'test/REQUEST', (err, res) => {
            expect(err).to.not.exist()
            expect(res).to.exist()
            expect(res.id).to.equal(userTicket.user)
            done()
          }))
        })
      })
    })

    it('queues and flush requests during connection cycle', (done, onCleanup) => {
      createEnv(onCleanup).then(({ userTicket, mockStore }) => {
        const store = mockStore()

        store.dispatch(nesActions.request('/user', 'test/REQUEST', (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          expect(res.id).to.equal(userTicket.user)
          done()
        }))

        const queue = store.getState().nes.queue
        expect(queue).to.have.length(1)

        store.dispatch(nesActions.connect(userTicket)).then(() => {
          store.dispatch(nesActions.request('/user', 'test/REQUEST', (ignore, res) => {
            expect(store.getState().nes.queue).to.have.length(0)
          }))
        })
      })
    })

    it('subscribes to path and call action on update', async (done, onCleanup) => {
      try {
        const { appTicket, userTicket, mockStore } = await createEnv(onCleanup)

        const store = mockStore({ auth: { app: appTicket, user: userTicket } })

        // create room
        const createRes = await store.dispatch(roomActions.createRoom('TESTROOM'))
        expect(createRes.data.id).to.exist()
        const roomId = createRes.data.id

        const connectTicket = await store.dispatch(nesActions.connect(userTicket))
        expect(connectTicket).to.equal(userTicket)
        expect(store.getState().nes.connected).to.be.true()

        return new Promise((resolve, reject) => {
          store.dispatch(nesActions.subscribe(`/room/${roomId}`, SUB_UPDATE, (err) => {
            expect(err).to.not.exist()

            const getCurrentRoom = () => store.getState().rooms[roomId]
            expect(Object.keys(getCurrentRoom().messages)).to.have.length(0)

            store.dispatch(nesActions.request({
              path: `/room/${roomId}`,
              method: 'PATCH',
              payload: { status: 'active' }
            }, 'test/REQUEST', (patchErr) => {
              expect(patchErr).to.not.exist()

              const req = { path: `/room/${roomId}/activity`, method: 'POST', payload: { input: 'whatwhat\n', pos: 0 } }
              store.dispatch(nesActions.request(req, 'test/REQUEST', (postErr) => {
                expect(postErr).to.not.exist()
                expect(Object.keys(getCurrentRoom().messages)).to.have.length(1)
                resolve()
              }))
            }))
          }))
        })
      } catch (e) {
        console.error(e)
      }
    })

    it('unsubscribes from path and not call action on update', (done, onCleanup) => {
      createEnv(onCleanup).then(({ appTicket, userTicket, mockStore }) => {
        const store = mockStore({ auth: { app: appTicket, user: userTicket } })
        return store.dispatch(roomActions.createRoom('TESTROOM'))
          .then((createRes) => {
            expect(createRes.data.id).to.exist()
            const roomId = createRes.data.id

            store.dispatch(nesActions.connect(userTicket)).then((connectTicket) => {
              expect(connectTicket).to.equal(userTicket)
              expect(store.getState().nes.connected).to.be.true()

              store.dispatch(nesActions.subscribe(`/room/${roomId}`, SUB_UPDATE, (err) => {
                expect(err).to.not.exist()

                const getCurrentRoom = () => store.getState().rooms[roomId]

                store.dispatch(nesActions.unsubscribe(`/room/${roomId}`))

                store.dispatch(nesActions.request({
                  path: `/room/${roomId}`,
                  method: 'PATCH',
                  payload: { status: 'active' }
                }, 'test/REQUEST', (patchErr) => {
                  expect(patchErr).to.not.exist()

                  store.dispatch(nesActions.request({
                    path: `/room/${roomId}/activity`,
                    method: 'POST',
                    payload: { input: 'whatwhat\n', pos: 0 }
                  }, 'test/REQUEST', (postErr) => {
                    expect(postErr).to.not.exist()
                    expect(Object.keys(getCurrentRoom().messages)).to.have.length(0)
                    done()
                  }))
                }))
              }))
            })
          }).catch((e) => {
            console.error(e)
          })
      })
    })
  })

  describe('State', () => {
    it('CONNECT', (done) => {
      const actual = nesReducer(initialState, { type: CONNECT })
      const expected = Object.assign({}, initialState, { connected: false, connecting: true })

      expect(actual).to.equal(expected)
      done()
    })

    it('CONNECT_SUCCESS', (done) => {
      const actual = nesReducer(initialState, { type: CONNECT_SUCCESS })
      const expected = Object.assign({}, initialState, {
        connectAttempts: 0,
        connected: true,
        connecting: false,
        disconnect: null,
        error: null
      })

      expect(actual).to.equal(expected)
      done()
    })

    it('CONNECT_ERROR', (done) => {
      const actual = nesReducer(initialState, { type: CONNECT_ERROR, payload: { statusCode: 500 } })
      const expected = Object.assign({}, initialState, {
        connected: false,
        connecting: false,
        error: { statusCode: 500 }
      })

      expect(actual).to.equal(expected)
      done()
    })

    it('DISCONNECT', (done) => {
      const payload = { type: 'testerror' }
      const actual = nesReducer(initialState, { type: DISCONNECT, payload })
      const expected = Object.assign({}, initialState, { connected: false, disconnect: payload })

      expect(actual).to.equal(expected)
      done()
    })

    it('QUEUE_ADD', (done) => {
      const payload = {
        action: 'request',
        req: {
          method: 'GET',
          path: '/user',
          queued: true
        },
        handlerAction: 'test/REQUEST',
        ts: 11111
      }
      const actual = nesReducer(initialState, { type: QUEUE_ADD, payload })

      const expected = Object.assign({}, initialState, {
        queue: [payload]
      })

      expect(actual).to.equal(expected)
      done()
    })

    it('FLUSH_QUEUE', (done) => {
      const payload = {
        action: 'request',
        req: {
          method: 'GET',
          path: '/user',
          queued: true
        },
        handlerAction: 'test/REQUEST',
        ts: 11111
      }

      const state = Object.assign({}, initialState, {
        queue: [payload]
      })
      const actual = nesReducer(initialState, { type: FLUSH_QUEUE })

      const expected = Object.assign({}, state, {
        queue: []
      })

      expect(actual).to.equal(expected)
      done()
    })
  })
})
