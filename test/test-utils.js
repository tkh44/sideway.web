const Mock = require('@sideway/mock')(require('@sideway/api'))
const Mailer = require('@sideway/api/lib/mailer')
import { omit } from 'lodash'
import ls from '../lib/utils/localstorage'
import { expect, fail } from 'code'
import { configureStore } from '../lib/redux/store'
import { api } from 'api'

export const createMockStore = (initialState = {}, client) => {
  return (stateOverride, middleware = []) => {
    return configureStore({ ...initialState, ...stateOverride }, middleware, { client })
  }
}

export const createEnv = (onCleanup, createUser = true) => {
  return new Promise((resolve, reject) => {
    const options = {
      onCleanup,
      client: 'none'
    }

    if (createUser === false) {
      options.user = false
    }

    Mock.server(options, (server, appTicket, userTicket, client) => {
      ls.clear()
      ls.setItem('appTicket', appTicket)

      if (createUser) {
        ls.setItem('userTicket', userTicket)
      }

      const publicApi = server.app.config.server.public.api
      const uri = publicApi
      window.sideway = { server: { api: uri }, hawk: { app: server.settings.app.vault.apps.web } }

            // If you are not creating a user client will be null
      if (!client) {
        client = {
          disconnect: (cb) => setTimeout(() => cb(), 10)
        }
      }

      client.disconnect(() => {
        const mockStore = createMockStore(
          {
            profile: createUser ? { id: userTicket.user, name: 'Test User', username: 'test_user', primary: 'test@example.com' } : {}
          },
          client
        )

        const emailToken = createUser ? Mailer.generateTicket(server.settings.app, userTicket.user, 'test@example.com', 'verify') : null

        resolve({ server, appTicket, userTicket, emailToken, mockStore })
      })
    })
  }).catch((e) => {
    console.error(e)
    fail(e)
  })
}

export const createUser = (server, appTicket) => {
  return new Promise((resolve, reject) => {
    Mock.user(server, appTicket, (userTicket) => {
      return api('/user', userTicket)
                .then((res) => {
                  resolve({ ticket: userTicket, profile: res.data })
                })
                .catch(reject)
    })
  })
}

export const expectResponse = (state, fetching, data, error) => {
  expect(state.$$meta.fetching).to.equal(fetching)

  const cleanData = Object.assign({}, omit(state, '$$meta'))
  if (data) {
    expect(cleanData).to.equal(data)
    expect(state.$$meta.error).to.not.exist()
  }

  if (error) {
    expect(state.$$meta.ok).to.equal(!error)
  }
}
