import { expect } from 'code'
import Lab from 'lab'
import { createEnv, expectResponse } from '../test-utils'
import socialReducer, { initialState, socialActions, ABOUT } from 'redux/social'

const lab = exports.lab = Lab.script()
const { describe, it } = lab

describe('Social Redux', () => {
  describe('Actions', () => {
    describe('ABOUT', () => {
      it('gets user about info by id', async (done, onCleanup) => {
        const { appTicket, userTicket, mockStore } = await createEnv(onCleanup)
        const store = mockStore({ auth: { user: userTicket, app: appTicket } })
        const username = store.getState().profile.username

        const res = await store.dispatch(socialActions.about(userTicket.user, 'id', false))
        expect(res).to.exist()
        expect(res.data.id).to.equal(userTicket.user)
        expect(res.data.list).to.exist()

        const user = store.getState().social[username]
        expect(user.username).to.equal(username)
        expect(user.list).to.be.an.array()
      })

      it('gets user about info by username', async (done, onCleanup) => {
        const { appTicket, userTicket, mockStore } = await createEnv(onCleanup)
        const store = mockStore({ auth: { user: userTicket, app: appTicket } })
        const username = store.getState().profile.username

        const res = await store.dispatch(socialActions.about(username, 'username', false))
        expect(res).to.exist()
        expect(res.data.id).to.equal(userTicket.user)
        expect(res.data.list).to.exist()

        const user = store.getState().social[username]
        expect(user.username).to.equal(username)
        expect(user.list).to.be.an.array()
      })

      it('gets minimal user about info', async (done, onCleanup) => {
        const { appTicket, userTicket, mockStore } = await createEnv(onCleanup)
        const store = mockStore({ auth: { user: userTicket, app: appTicket } })
        const username = store.getState().profile.username

        const res = await store.dispatch(socialActions.about(username, 'username', true))
        expect(res).to.exist()
        expect(res.data.id).to.equal(userTicket.user)
        expect(res.data.list).to.not.exist()

        const user = store.getState().social[username]
        expect(user.username).to.equal(username)
        expect(user.list).to.equal([])
      })
    })
  })

  describe('State', () => {
    it('returns the initial state', (done) => {
      expect(socialReducer({}, { type: 'IGNORE_ACTION' })).to.equal(initialState)
      done()
    })

    describe('ABOUT', () => {
      const getRequest = {
        path: '/about/bob',
        method: 'GET'
      }

      it('handles about request', (done) => {
        const newState = socialReducer(initialState, {
          type: ABOUT,
          meta: { request: getRequest, fetching: true }
        })

        const profile = newState.bob
        expectResponse(profile, true)
        done()
      })

      it('handles about response success', (done) => {
        const data = {
          id: '1',
          display: 'Bob Bobberson',
          username: 'bob',
          name: 'Bob Bobberson',
          avatar: 'image_url.jpg',
          networks: {
            twitter: 'bobiscool'
          },
          list: [
            {
              id: '1',
              active: false,
              activity: {},
              limits: {
                audience: 5,
                idle: 300000,
                idleMax: 300000
              },
              messages: [
                {
                  text: 'Whats up\n',
                  ts: 1465886853601,
                  user: '1'
                },
                {
                  system: true,
                  text: 'The conversation ended due to inactivity',
                  ts: 1465917771677
                }
              ],
              owner: '1',
              participants: {
                1: {
                  display: 'Bob Bobberson',
                  username: 'bob',
                  name: 'Bob Bobberson',
                  avatar: 'image_url.jpg'
                }
              },
              public: true,
              system: {
                peak: 1
              },
              title: 'Hey whats up',
              update: {
                created: 1465860973791,
                modified: 1465917771677
              }
            }
          ]
        }

        const newState = socialReducer(initialState, {
          type: ABOUT,
          payload: data,
          meta: {
            request: getRequest,
            response: { ok: true },
            fetching: false
          }
        })

        const profile = newState.bob
        expectResponse(profile, false, {
          ...data,
          list: data.list.map((room) => room.id)
        })
        done()
      })

      it('handles about response error', (done) => {
        const error = { message: 'Failed', data: {} }
        const newState = socialReducer(initialState, {
          type: ABOUT,
          payload: error,
          meta: {
            request: getRequest,
            response: { ok: false },
            fetching: false
          }
        })

        const profile = newState.bob
        expectResponse(profile, false, null, error)
        done()
      })
    })
  })
})
