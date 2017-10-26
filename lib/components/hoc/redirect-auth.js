import { Component } from 'react'
import { connect } from 'react-redux'

const redirectAuth = WrappedComponent => {
  class AuthRedirect extends Component {
    render () {
      return <WrappedComponent {...this.props} />
    }
  }

  const mapStateToProps = (state, props) => {
    return {
      auth: state.auth
    }
  }

  return connect(mapStateToProps)(AuthRedirect)
}

export default redirectAuth
