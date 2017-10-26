import { connect } from 'react-redux'
import { get } from 'lodash'
import compose from 'recompose/compose'
import lifecycle from 'recompose/lifecycle'
import withRouter from 'react-router-dom/es/withRouter'
import { sitrep } from 'redux/sitrep'
import { authActions } from 'redux/auth'
import { isValid } from 'utils/hawk'
import { isLoggedIn } from 'selectors/auth'

const mapStateToProps = (state, props) => {
  return {
    loggedIn: isLoggedIn(state),
    auth: state.auth
  }
}

export default compose(
  connect(mapStateToProps),
  withRouter,
  lifecycle({
    componentDidMount: async function () {
      const {
        dispatch,
        location,
        loggedIn,
        match: { params },
        history: { replace }
      } = this.props

      const state = get(location, 'query.state', '/')

      let redirect = state
      if (redirect.includes('error') || redirect === '/500') {
        redirect = '/'
      }

      const handleSuccess = ({ action }) => {
        const isVerification = action === 'verify'
        if (isVerification) {
          const notification = {
            type: 'success',
            message: 'Email address verified',
            duration: isVerification ? 3000 : 5000
          }

          dispatch(sitrep.notify(notification))
        }
        replace(redirect)
      }

      const handleFailure = () => {
        dispatch(
          sitrep.notify({
            type: 'error',
            message: "We're having a hard time verifying you with that link.\nPlease try again.",
            duration: 3000
          })
        )

        if (!loggedIn) {
          dispatch({
            type: 'modal/SHOW',
            payload: { modal: 'login', data: state }
          })
        }

        replace(redirect)
      }

      const { ok, data: { rsvp, ext: { action } } } = await dispatch(
        authActions.email(params.token)
      )
      if (!ok) {
        return handleFailure()
      }

      let userTicket
      try {
        await dispatch(authActions.getAppTicket())
        userTicket = await dispatch(authActions.getUserTicket(rsvp))
      } catch (err) {
        return handleFailure()
      }

      if (userTicket && isValid(userTicket)) {
        return handleSuccess({ action, ticket: userTicket })
      }

      return handleFailure()
    }
  })
)(props => null)
