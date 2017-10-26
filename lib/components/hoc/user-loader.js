import { Component } from 'react'
import shallowCompare from 'shallow-compare'
import { get } from 'lodash'
import { connect } from 'react-redux'
import { socialActions } from 'redux/social'
import { getSocialUserById, getSocialUserByUsername } from 'selectors/social'

const loadUser = (loadUserBy = 'username', minimal = true) => {
  return WrappedComponent => {
    class LoadUser extends Component {
      componentDidMount () {
        this.fetch()
      }

      shouldComponentUpdate (nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
      }

      render () {
        return (
          <WrappedComponent {...this.props} user={this.props.storedUser} />
        )
      }

      fetch = () => {
        const { dispatch, storedUser, userAccount } = this.props

        const isFetching = get(storedUser, '$$meta.fetching', false)
        const hasStatus = get(storedUser, '$$meta.status', false)
        if (!userAccount || isFetching || hasStatus) {
          return
        }

        dispatch(socialActions.about(userAccount, loadUserBy, minimal))
      };
    }

    const mapStateToProps = (state, props) => {
      const userAccount = props.userAccount
      const initialUser = props.user
      const storedUser = (loadUserBy === 'username'
        ? getSocialUserByUsername(state, userAccount)
        : getSocialUserById(state, userAccount)) || {}

      return {
        initialUser,
        storedUser,
        userAccount
      }
    }

    return connect(mapStateToProps)(LoadUser)
  }
}

export default loadUser
