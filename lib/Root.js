import { Provider } from 'react-redux'
import { ClientProvider } from 'react-nes'
import BrowserRouter from 'react-router-dom/es/BrowserRouter'
import Route from 'react-router-dom/es/Route'
import App from 'components/App'

const Root = ({ client, store, history }) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ClientProvider client={client}>
          <Route component={App} />
        </ClientProvider>
      </BrowserRouter>
    </Provider>
  )
}

export default Root
