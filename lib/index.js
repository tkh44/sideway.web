import 'styles/index.css'
import '-!file-loader?name=images/s.png!public/images/s.png'
import { render } from 'react-dom'
import { configureStore } from 'redux/store'
import { authActions } from 'redux/auth'
import { createNesClient } from 'redux/nes'
import { setupPushState } from 'redux/push'
import { appActions } from 'redux/app'

const client = createNesClient(window.sideway.server.api.replace('http', 'ws'))
const rootEl = document.getElementById('SidewayApp')
const store = configureStore(
  Object.assign({ app: window.sideway }, window.initialState),
  null,
  { client }
)

if (
  window.location.search.indexOf('rsvp') < 0 &&
  window.location.pathname.indexOf('/t/') < 0
) {
  store.dispatch(authActions.initAuth())
}

if (__PROD__) {
  System.import('./analytics').then(() => {
    console.log('analytics loaded')
  })
}

// Install Service Worker
const runtime = require('offline-plugin/runtime')
runtime.install({
  onUpdating: () => {
    console.log('SW Event:', 'onUpdating')
  },
  onUpdateReady: () => {
    console.log('SW Event:', 'onUpdateReady')
    // Tells to new SW to take control immediately
    runtime.applyUpdate()
  },
  onUpdated: () => {
    console.log('SW Event:', 'onUpdated')
    setTimeout(() => {
      store.dispatch(appActions.updateAvailable(true))
    })
  },
  onUpdateFailed: () => {
    console.log('SW Event:', 'onUpdateFailed')
  }
})

setupPushState(store)()

let run = () => {
  const Root = require('./Root').default
  render(<Root store={store} client={client} />, rootEl)
}

if (module.hot) {
  let renderTimeout
  const renderApp = run
  const renderError = error => {
    const RedBox = require('redbox-react')

    render(<RedBox error={error} />, rootEl)
  }

  run = () => {
    renderTimeout = null

    try {
      renderApp()
    } catch (error) {
      console.error(error)
      renderError(error)
    }
  }

  module.hot.accept('./Root', () => {
    if (renderTimeout) {
      clearTimeout(renderTimeout)
    }

    renderTimeout = setTimeout(run, 16)
  })
}

run()
