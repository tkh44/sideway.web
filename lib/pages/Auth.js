import { connect } from 'react-redux'
import compose from 'recompose/compose'
import lifecycle from 'recompose/lifecycle'
import withRouter from 'react-router-dom/es/withRouter'
import { profileActions } from 'redux/profile'
import { sitrep } from 'redux/sitrep'
import { registerActions } from 'redux/register'
import { authActions } from 'redux/auth'
import { decodeQueryString } from 'utils/string'

export default compose(
  connect(),
  withRouter,
  lifecycle({
    componentDidMount () {
      const { dispatch, location, history } = this.props
      const replace = history.replace
      const query = decodeQueryString(location.search)
      const {
        signup,
        rsvp,
        error,
        username,
        name,
        email,
        state = location.pathname || '/'
      } = query

      let redirect = state
      if (
        redirect.includes('error') ||
        redirect.includes('/auth') ||
        redirect === '/500'
      ) {
        redirect = '/'
      }

      if (error) {
        replace('/error')
        return
      }

      const isLinkingAccount = signup && redirect.includes(':link')

      if (isLinkingAccount) {
        const provider = redirect.split(':')[2]

        return dispatch(profileActions.linkAccount(signup)).then(res => {
          if (!res.ok) {
            dispatch(
              sitrep.error('We could not link your account at this time.')
            )
            replace('/error')
            return
          }

          dispatch(
            sitrep.success(
              `Your ${provider
                .charAt(0)
                .toUpperCase() + provider.slice(1)} account has been linked!`
            )
          )
          replace({ pathname: redirect.split(':link')[0] })
        })
      }

      if (signup) {
        const registerData = { username, name, email, network: signup }

        dispatch(registerActions.setRegisterData(registerData))
        replace({ pathname: redirect })

        dispatch({ type: 'modal/SHOW', payload: { modal: 'register' } })
        return
      }

      if (rsvp) {
        dispatch(authActions.initAuth(rsvp))
        replace(redirect)
        return
      }

      replace('/')
      dispatch({
        type: 'modal/SHOW',
        payload: { modal: 'login', data: redirect }
      })
    }
  })
)(props => null)
