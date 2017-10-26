import { expect } from 'code'
import Lab from 'lab'
import { createEnv } from '../test-utils'
import ls from 'utils/localstorage'
import reducer, {
    authActions,
    initialState,
    INIT_AUTH,
    APP_TICKET_SUCCESS,
    APP_TICKET_ERROR,
    APP_TICKET_ONLY_AUTH_COMPLETE,
    USER_TICKET_SUCCESS,
    USER_TICKET_RENEWAL_SUCCESS,
    USER_TICKET_ERROR,
    LOGOUT
} from 'redux/auth'

const lab = exports.lab = Lab.script()
const { describe, it } = lab

describe('Auth', () => {
  describe('Network', () => {
    it('init', async (done, onCleanup) => {
      const { mockStore } = await createEnv(onCleanup)
      ls.removeItem('appTicket')
      const store = mockStore({ auth: {} })
      store.dispatch(authActions.initAuth(null))
      expect(store.getState().auth.inProgress).to.be.true()
    })

    it('init with rsvp', async(done, onCleanup) => {
      const { mockStore } = await createEnv(onCleanup)
      ls.removeItem('appTicket')
      const store = mockStore({ auth: {} })
      store.dispatch(authActions.initAuth('rsvp'))
      expect(store.getState().auth.rsvp).to.equal('rsvp')
    })

    it('get app ticket from cache', async (done, onCleanup) => {
      const { appTicket, mockStore } = await createEnv(onCleanup)
      const store = mockStore({ auth: { app: appTicket } })
      await store.dispatch(authActions.getAppTicket())

      const storeAppTicket = store.getState().auth.app
      expect(storeAppTicket).to.equal(appTicket)
    })

    it('get app ticket from cache and renew', async(done, onCleanup) => {
      const { appTicket, mockStore } = await createEnv(onCleanup)
      const expiredAppTicket = Object.assign(appTicket, { exp: 1 })
      ls.setItem('appTicket', expiredAppTicket)
      const store = mockStore()
      await store.dispatch(authActions.getAppTicket())

      const storeAppTicket = store.getState().auth.app
      expect(storeAppTicket).to.not.equal(expiredAppTicket)
    })

    it('get app ticket from server', async(done, onCleanup) => {
      const { appTicket, mockStore } = await createEnv(onCleanup)
      ls.removeItem('appTicket')
      const store = mockStore({ auth: { app: appTicket } })
      await store.dispatch(authActions.getAppTicket())

      const storeAppTicket = store.getState().auth.app
      expect(storeAppTicket).to.not.equal(appTicket)
    })

    it('get user ticket from cache', async (done, onCleanup) => {
      const { appTicket, userTicket, mockStore } = await createEnv(onCleanup)
      const store = mockStore({ auth: { user: userTicket, app: appTicket } })
      await store.dispatch(authActions.getUserTicket())
      const storeUserTicket = store.getState().auth.user
      expect(storeUserTicket).to.equal(userTicket)
    })

    it('get user ticket and renew', async (done, onCleanup) => {
      const { appTicket, userTicket, mockStore } = await createEnv(onCleanup)
      const expiredUserTicket = { ...userTicket, exp: 1234 }
      ls.setItem('userTicket', expiredUserTicket)
      const store = mockStore({ auth: { user: expiredUserTicket, app: appTicket } })

      await store.dispatch(authActions.getUserTicket())
      const storeUserTicket = store.getState().auth.user
      expect(storeUserTicket).to.exist()
      expect(storeUserTicket).to.not.equal(expiredUserTicket)
    })

    it('get user ticket from server using rsvp', async(done, onCleanup) => {
      const { emailToken, appTicket, mockStore } = await createEnv(onCleanup)
      ls.removeItem('userTicket')
      const store = mockStore({ auth: { app: appTicket } })
      const { data: { rsvp } } = await store.dispatch(authActions.email(emailToken))
      await store.dispatch(authActions.getUserTicket(rsvp))
      const storeUserTicket = store.getState().auth.user
      expect(storeUserTicket).to.exist()
      expect(storeUserTicket).to.include(Object.keys(appTicket).concat('user'))
    })

    it('login via email token', async (done, onCleanup) => {
      const { emailToken, mockStore } = await createEnv(onCleanup)
      const store = mockStore()

      const emailLoginRes = await store.dispatch(authActions.email(emailToken))
      expect(emailLoginRes.data.rsvp).to.exist()
      expect(emailLoginRes.data.ext.action).to.equal('verify')
    })
  })

  describe('State', () => {
    it('INIT_AUTH', (done) => {
      const actual = reducer(initialState, { type: INIT_AUTH, payload: 'rsvp' })
      const expected = Object.assign({}, initialState, { inProgress: true, rsvp: 'rsvp' })

      expect(actual).to.equal(expected)
      done()
    })

    it('APP_TICKET_SUCCESS', (done) => {
      const fakeAppTicket = { exp: 'now', id: 'fake-app-ticket' }
      const actual = reducer(initialState, { type: APP_TICKET_SUCCESS, payload: fakeAppTicket })
      const expected = Object.assign({}, initialState, {
        app: fakeAppTicket,
        appError: null,
        user: null
      })

      expect(actual).to.equal(expected)
      done()
    })

    it('APP_TICKET_ERROR', (done) => {
      const error = { foo: 'bar' }
      const actual = reducer(initialState, { type: APP_TICKET_ERROR, payload: error })
      const expected = Object.assign({}, initialState, {
        app: null,
        appError: error,
        user: null,
        inProgress: false
      })

      expect(actual).to.equal(expected)
      done()
    })

    it('APP_TICKET_ONLY_AUTH_COMPLETE', (done) => {
      const actual = reducer(initialState, { type: APP_TICKET_ONLY_AUTH_COMPLETE })
      const expected = Object.assign({}, initialState, {
        app: null,
        user: null,
        inProgress: false
      })

      expect(actual).to.equal(expected)
      done()
    })

    it('USER_TICKET_SUCCESS', (done) => {
      const fakeTicket = { exp: 1234, user: '1' }
      const actual = reducer(initialState, { type: USER_TICKET_SUCCESS, payload: fakeTicket })
      expect(actual.user).to.equal(fakeTicket)
      done()
    })

    it('USER_TICKET_ERROR', (done) => {
      const error = { foo: 'bar' }
      const actual = reducer(initialState, { type: USER_TICKET_ERROR, payload: error })
      const expected = Object.assign({}, initialState, {
        app: null,
        user: null,
        userError: error,
        inProgress: false
      })

      expect(actual).to.equal(expected)
      done()
    })

    it('USER_TICKET_RENEWAL_SUCCESS', (done) => {
      const fakeTicket = { exp: 1234, user: '1' }
      const actual = reducer(initialState, { type: USER_TICKET_RENEWAL_SUCCESS, payload: fakeTicket })
      expect(actual.user).to.equal(fakeTicket)
      done()
    })

    it('LOGOUT', (done) => {
      const actual = reducer(initialState, { type: LOGOUT })
      const expected = Object.assign({}, initialState, {
        app: null,
        user: null
      })

      expect(actual).to.equal(expected)
      done()
    })
  })
})
