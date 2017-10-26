import { expect } from 'code'
import Lab from 'lab'
import { createEnv } from './test-utils'
import ls from 'utils/localstorage'
import { getTicket, api, createApiAction, parseResourceFromPath } from 'api'

const lab = exports.lab = Lab.script()
const { describe, it } = lab

describe('api', () => {
  it('getTicket', (done) => {
    const userTicket = { exp: 1, user: '1' }
    const appTicket = { exp: 2 }

    ls.setItem('appTicket', appTicket)
    expect(getTicket()).to.equal(appTicket)

    ls.setItem('userTicket', userTicket)
    expect(getTicket()).to.equal(userTicket)

    done()
  })

  it('api', async (done, onCleanup) => {
    const { userTicket } = await createEnv(onCleanup)

    const res1 = await api('/user', userTicket)
    expect(res1.status).to.equal(200)

    const res2 = await api({ base: window.sideway.server.api, path: '/user', method: 'GET' })
    expect(res2.status).to.equal(200)

    const res3 = await api({
      base: window.sideway.server.api,
      path: '/user',
      method: 'PATCH',
      headers: { foo: 'bar' },
      payload: { name: 'Bob' }
    })
    expect(res3.status).to.equal(204)

    const res4 = await api({
      base: window.sideway.server.api,
      path: '/user',
      method: 'PATCH',
      headers: { foo: 'bar' },
      payload: { name: 'Bob' }
    }, { user: '4' })
    expect(res4.status).to.equal(401)
  })

  it('createApiAction', (done) => {
    const getState = () => ({
      auth: {
        user: 'user-ticket',
        app: 'app-ticket'
      }
    })

    const dispatch = (i) => i

    expect(createApiAction('FOO', '/user')()(dispatch, getState)).to.equal({
      type: 'FOO',
      request: '/user',
      meta: { ticket: 'user-ticket' }
    })

    const apiAction = createApiAction('FOO', (a, b, c) => ({ path: a, base: b, method: c }))
    expect(apiAction('/user', 'sideway.com', 'GET')(dispatch, getState)).to.equal({
      type: 'FOO',
      request: {
        path: '/user',
        base: 'sideway.com',
        method: 'GET'
      },
      meta: {
        ticket: 'user-ticket'
      }
    })

    done()
  })

  it('parseResourceFromPath', (done) => {
    expect(parseResourceFromPath('/user/5?foo=bar')).to.equal('5')
    expect(parseResourceFromPath()).to.equal('')
    done()
  })
})
