const Mock = require('@sideway/mock')(require('@sideway/api'))
import { expect } from 'code'
import Lab from 'lab'
import { bindActionCreators } from 'redux'
import { omit } from 'lodash'
import { createEnv, expectResponse } from '../test-utils'
import ls from 'utils/localstorage'
import { actions as nesActions } from 'redux/nes'
import reducer, {
    profileActions,
    initialState,
    CREATE_USER,
    GET_PROFILE,
    PROFILE_SUB_UPDATE,
    REMOVE_EMAIL,
    VERIFY_EMAIL
} from 'redux/profile'

const lab = exports.lab = Lab.script()
const { describe, it } = lab

describe('Profile', () => {
  describe('Profile CRUD', () => {
    it('create user', async (done, onCleanup) => {
      try {
        const { server, appTicket, mockStore } = await createEnv(onCleanup, false)
        const store = mockStore({ auth: { app: appTicket } })
        const authCode = '1234567890123456'
        ls.setItem('code', authCode)
        const network = await new Promise((resolve, reject) => {
          Mock.login(server, appTicket.app, (err, sealed) => {
            expect(err).to.not.exist()
            resolve(sealed)
          })
        })

        const user = {
          name: 'Test User Two',
          username: 'test_user2',
          email: 'testerson@example.com',
          network,
          code: authCode
        }

        const { data } = await store.dispatch(profileActions.create(user, 'sideway'))
        const profile = store.getState().profile
        expect(profile.primary).to.equal(user.email)
        expect(profile.name).to.equal(user.name)
        expect(profile.username).to.equal(user.username)
        expect(data.rsvp).to.exist()
      } catch (e) {
        return e
      }
    })

    it('get sub patch flow', (done, onCleanup) => {
      createEnv(onCleanup).then(({ appTicket, userTicket, emailToken, mockStore }) => {
        const store = mockStore({ auth: { user: userTicket, app: appTicket } })
        store.dispatch(nesActions.connect(userTicket)).then(() => {
          store.dispatch(profileActions.subscribeProfile((err) => {
            expect(err).to.not.exist()
            store.dispatch(profileActions.getProfile()).then((res) => {
              expect(res).to.exist()
              expect(res.data.id).to.equal(userTicket.user)
              store.dispatch(profileActions.patchProfile({ name: 'John' })).then((patchRes) => {
                expect(patchRes.ok).to.be.true()
                expect(patchRes.data).to.equal({})
                expect(patchRes.status).to.equal(204)

                setTimeout(() => {
                  expect(store.getState().profile.name).to.equal('John')
                  done()
                }, 50)
              }).catch((e) => console.error(e))
            }).catch((e) => console.error(e))
          }))
        }).catch((e) => console.error(e))
      })
    })

    it('add email', (done, onCleanup) => {
      createEnv(onCleanup).then(({ server, appTicket, userTicket, emailToken, mockStore }) => {
        const store = mockStore({ auth: { user: userTicket, app: appTicket } })

        store.dispatch(profileActions.getProfile()).then((res) => {
          const newEmail = res.data.username + '44@sideway.com'
          store.dispatch(profileActions.addEmail(newEmail)).then((patchRes) => {
            const profile = store.getState().profile
            expect(profile.emails).to.include(newEmail)

            store.dispatch(profileActions.getProfile()).then((getRes) => {
              expect(getRes.data.emails).to.include(newEmail)
              done()
            })
          })
        })
      })
    })
  })

  describe('User App Data', () => {
    it('handles app data flow', (done, onCleanup) => {
      createEnv(onCleanup).then(({ server, appTicket, userTicket, emailToken, mockStore }) => {
        const store = mockStore({ auth: { user: userTicket, app: appTicket } })
        const { dispatch, getState } = store
        const { getData, putData, deleteData } = bindActionCreators(profileActions, dispatch)

        getData().then((res) => {
          expect(res.data).to.be.empty()

          putData('a', 'first put').then((putRes) => {
            expect(putRes.status).to.equal(204)
            expect(getState().profile.app.a).to.equal('first put')

            getData('a').then((getRes) => {
              expect(getRes.status).to.equal(200)
              expect(getState().profile.app.a).to.equal('first put')

              putData('b', 'second put').then(() => {
                expect(getState().profile.app.a).to.equal('first put')

                getData().then((secondGetRes) => {
                  expect(getState().profile.app).to.equal({
                    a: 'first put',
                    b: 'second put'
                  })

                  deleteData('a').then((delRes) => {
                    expect(delRes.status).to.equal(204)
                    expect(getState().profile.app).to.equal({
                      b: 'second put'
                    })

                    getData('b').then((thirdGetRes) => {
                      expect(thirdGetRes.data).to.equal('second put')
                      expect(getState().profile.app.b).to.equal('second put')
                      done()
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })

  describe('State', () => {
    it('should return the initial state', (done) => {
      expect(reducer(undefined, { type: 'IGNORE_ACTION' })).to.equal(initialState)
      done()
    })

    describe('CREATE', () => {
      const createRequest = {
        path: '/user?invite=sideway',
        method: 'POST',
        payload: { 'network': '*rsvp*' },
        query: { invite: 'sideway' }
      }

      it('request', (done) => {
        const newState = reducer(initialState, {
          type: CREATE_USER,
          meta: {
            request: createRequest,
            fetching: true
          }
        })
        expectResponse(newState, true)
        done()
      })

      it('success', (done) => {
        const data = { user: { id: '12345' }, rsvp: '*rsvp*' }
        const newState = reducer(initialState, {
          type: CREATE_USER,
          payload: data,
          meta: {
            request: createRequest,
            response: { ok: true },
            fetching: false
          }
        })

        expect(newState.id).to.equal(data.user.id)
        done()
      })

      it('error', (done) => {
        const newState = reducer(initialState, {
          type: CREATE_USER,
          meta: {
            request: createRequest,
            fetching: false,
            response: {
              status: 500
            }
          }
        })

        expect(newState).to.be.an.object()
        expect(newState.id).to.not.exist()
        done()
      })
    })

    describe('GET_PROFILE', () => {
      const getRequest = {
        path: '/user',
        method: 'GET',
        resource: 'user'
      }

      it('request', (done) => {
        const newState = reducer(initialState, {
          type: GET_PROFILE,
          meta: {
            request: getRequest,
            fetching: true
          }
        })
        expectResponse(newState, true)
        done()
      })

      it('success', (done) => {
        const data = { ...initialState, id: '12345' }
        const newState = reducer(initialState, {
          type: GET_PROFILE,
          payload: data,
          meta: {
            request: getRequest,
            response: { ok: true },
            fetching: false
          }
        })

        expectResponse(newState, false, data)
        done()
      })

      it('success with existing data', (done) => {
        const stateWithUser = {
          ...initialState,
          id: '123456',
          username: 'bob',
          $$meta: {
            fetching: false,
            status: 200
          }
        }

        const responseData = { ...initialState, username: 'bob2', id: '123456' }
        const newState = reducer(stateWithUser, {
          type: GET_PROFILE,
          payload: responseData,
          meta: {
            request: getRequest,
            response: { ok: true },
            fetching: false
          }
        })

        expectResponse(newState, false, responseData, null)
        done()
      })

      it('error', (done) => {
        const error = { message: 'Failed', data: {} }
        const newState = reducer(initialState, {
          type: GET_PROFILE,
          payload: error,
          meta: {
            request: getRequest,
            response: { ok: false },
            fetching: false
          }
        })

        expectResponse(newState, false, null, error)
        done()
      })

      it('error with existing data', (done) => {
        const stateWithUser = {
          ...initialState,
          id: '123456',
          username: 'bob',
          $$meta: {
            fetching: false,
            status: 200
          }
        }
        const error = { message: 'Failed', data: {} }
        const newState = reducer(stateWithUser, {
          type: GET_PROFILE,
          payload: error,
          meta: {
            fetching: false,
            request: getRequest,
            response: { ok: false }
          }
        })
        expectResponse(newState, false, stateWithUser.data, null)
        done()
      })
    })

    describe('PROFILE_SUB_UPDATE', () => {
      const stateWithUser = {
        ...initialState,
        id: '123456',
        username: 'bob',
        emails: {
          'bob@some.com': { verified: false, public: true }
        },
        scope: ['room:create']
      }

      it('updates string field', (done) => {
        const newState = reducer(stateWithUser, {
          type: PROFILE_SUB_UPDATE,
          payload: {
            message: { username: 'sam' }
          }
        })

        expect(omit(newState, '$$meta')).to.equal({
          ...stateWithUser,
          username: 'sam'
        })
        done()
      })

      it('handles object field', (done) => {
        const newState = reducer(stateWithUser, {
          type: PROFILE_SUB_UPDATE,
          payload: {
            message: {
              emails: {
                'bob@some.com': { verified: false, public: true },
                'bob2@some.com': { verified: false, public: true }
              }
            }
          }
        })

        expect(omit(newState, '$$meta')).to.equal({
          ...stateWithUser,
          emails: {
            'bob@some.com': { verified: false, public: true },
            'bob2@some.com': { verified: false, public: true }
          }
        })
        done()
      })

      it('handles deep object field', (done) => {
        const newState = reducer(stateWithUser, {
          type: PROFILE_SUB_UPDATE,
          payload: {
            message: {
              emails: {
                'bob@some.com': { verified: true, public: true }
              }
            }
          }
        })

        expect(omit(newState, '$$meta')).to.equal({
          ...stateWithUser,
          emails: {
            'bob@some.com': { verified: true, public: true }
          }
        })
        done()
      })

      it('handles array', (done) => {
        const newState = reducer(stateWithUser, {
          type: PROFILE_SUB_UPDATE,
          payload: {
            message: {
              scope: ['room:create', 'room:twitter']
            }
          }
        })

        expect(omit(newState, '$$meta')).to.equal({
          ...stateWithUser,
          scope: ['room:create', 'room:twitter']
        })
        done()
      })
    })

    describe('REMOVE_EMAIL', () => {
      const stateWithUser = {
        ...initialState,
        username: 'bob',
        id: '123456',
        emails: {
          'foo@gmail.com': { verified: false, 'public': false }
        }
      }

      const removeEmailRequest = {
        path: '/user/email/foo@gmail.com',
        method: 'DELETE',
        resource: 'foo@gmail.com'
      }

      it('success', (done) => {
        const newState = reducer(stateWithUser, {
          type: REMOVE_EMAIL,
          meta: {
            request: removeEmailRequest,
            response: { ok: true }
          }
        })

        expect(omit(newState, '$$meta')).to.equal({
          ...initialState,
          username: 'bob',
          id: '123456',
          emails: {}
        })
        done()
      })
    })

    describe('VERIFY_EMAIL', () => {
      const stateWithUser = {
        ...initialState,
        username: 'bob',
        id: '123456',
        emails: {
          'foo@gmail.com': { verified: false, 'public': false }
        }
      }

      const verifyEmailRequest = {
        path: '/user/email/foo@gmail.com',
        method: 'POST',
        payload: { action: 'verify' },
        resource: 'foo@gmail.com'
      }

      it('waiting', (done) => {
        const newState = reducer(stateWithUser, {
          type: VERIFY_EMAIL,
          meta: {
            request: verifyEmailRequest,
            response: { ok: true }
          }
        })

        expect(omit(newState, '$$meta')).to.equal({
          ...initialState,
          username: 'bob',
          id: '123456',
          emails: {
            'foo@gmail.com': { verified: 'waiting', 'public': false }
          }
        })
        done()
      })
    })
  })
})
