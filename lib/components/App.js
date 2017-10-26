import { Component } from 'react'
import { connect } from 'react-redux'
import { get } from 'lodash'
import { css, StyleSheet } from 'aphrodite/no-important'
import compose from 'recompose/compose'
import withRouter from 'react-router-dom/es/withRouter'
import Route from 'react-router-dom/es/Route'
import Redirect from 'react-router-dom/es/Redirect'
import Switch from 'react-router-dom/es/Switch'
import asyncComponent from 'hoc/async-component'
import ModalContainer from 'modals/ModalContainer'
import { authActions } from 'redux/auth'
import { isLoggedIn } from 'selectors/auth'
import { decodeQueryString } from 'utils/string'
import SwUpdateAvailable from 'ui/SwUpdateAvailable'

const mapStateToProps = (state, props) => {
  return {
    loggedIn: isLoggedIn(state),
    auth: state.auth
  }
}

const AuthErrorCatcher = compose(connect(mapStateToProps), withRouter)(
  class AuthErrorCatcher extends Component {
    componentDidMount () {
      const {
        auth,
        dispatch,
        location = {
          search: '',
          pathname: '/'
        },
        history: { replace }
      } = this.props
      const query = decodeQueryString(location.search)
      if (auth.appError) {
        replace('/')
      }

      if (auth.userError) {
        dispatch({
          type: 'modal/SHOW',
          payload: { modal: 'login', data: { nextState: location.pathname } }
        })
      }

      if (query && query.error) {
        if (query.error === 'invalid_application_id_http') {
          dispatch(authActions.resetAppTicket())
          dispatch({
            type: 'modal/SHOW',
            payload: {
              modal: 'login',
              data: { nextState: get(query, 'state', '/') }
            }
          })
        }
      }
    }

    componentWillReceiveProps (nextProps) {
      if (!this.props.auth.appError && nextProps.auth.appError) {
        nextProps.history.replace('/')
        return
      }

      if (!this.props.auth.userError && nextProps.auth.userError) {
        nextProps.dispatch({
          type: 'modal/SHOW',
          payload: {
            modal: 'login',
            data: { nextState: get(nextProps, 'location.pathname', '/') }
          }
        })
      }
    }

    render () {
      return null
    }
  }
)

const Insights = asyncComponent(() =>
  System.import('pages/Insights').then(module => module.default))

export default class App extends Component {
  previousLocation = this.props.location;

  componentWillUpdate (nextProps) {
    const { location } = this.props
    // set previousLocation if props.location is not modal
    if (
      nextProps.history.action !== 'POP' &&
      (!location.state || !location.state.modal)
    ) {
      this.previousLocation = this.props.location
    }
  }

  render () {
    const { location } = this.props
    const isModal = !!(location.state &&
      location.state.modal &&
      this.previousLocation !== location) // not initial render

    isModal && console.log('previousLocation', this.previousLocation)

    return (
      <div className={css(styles.fullHeight)}>
        <AuthErrorCatcher />
        <ModalContainer />
        <Switch location={isModal ? this.previousLocation : location}>
          <Route
            path='/'
            exact
            component={asyncComponent(() =>
              System.import('pages/Home').then(module => module.default))}
          />
          <Route
            path='/user/:account'
            component={asyncComponent(() =>
              System.import('pages/About').then(module => module.default))}
          />
          <Route
            path='/pages'
            component={asyncComponent(() =>
              System.import('pages/PageList').then(module => module.default))}
          />
          <Route
            path='/page/:page'
            component={asyncComponent(() =>
              System.import('pages/PageDetail').then(module => module.default))}
          />
          <Route
            path='/room/:roomId'
            component={asyncComponent(() =>
              System.import('pages/Room').then(module => module.default))}
          />
          <Route path='/insight/:roomId' component={Insights} />
          <Route
            path='/auth'
            component={asyncComponent(() =>
              System.import('pages/Auth').then(module => module.default))}
          />
          <Route
            path='/t/:token'
            component={asyncComponent(() =>
              System.import('pages/EmailToken').then(module => module.default))}
          />
          <Route
            path='/terms'
            component={asyncComponent(() =>
              System.import('pages/TermsPages').then(module => module.default))}
          />
          <Route
            path='/404'
            component={asyncComponent(() =>
              System.import('pages/Error').then(module => module.default))}
          />
          <Route
            path='/500'
            component={asyncComponent(() =>
              System.import('pages/Error').then(module => module.default))}
          />
          <Route
            path='/error'
            component={asyncComponent(() =>
              System.import('pages/Error').then(module => module.default))}
          />
          <Route
            path='/:account'
            component={asyncComponent(() =>
              System.import('pages/About').then(module => module.default))}
          />
          <Route render={() => <Redirect to='/404' />} />
        </Switch>
        {isModal
          ? <Route
            path='/insight/:roomId'
            render={({ match, location, history }) => {
              return (
                <Insights
                  match={match}
                  location={location}
                  history={history}
                  isModal
                  />
              )
            }}
            />
          : null}
        <SwUpdateAvailable />
      </div>
    )
  }
}

const styles = StyleSheet.create({
  fullHeight: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  }
})
