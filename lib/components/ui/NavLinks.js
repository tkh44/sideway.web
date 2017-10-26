import { Component } from 'react'
import { connect } from 'react-redux'
import { css, StyleSheet } from 'aphrodite/no-important'
import Link from 'react-router-dom/es/Link'
import { authActions } from 'redux/auth'
import { registerActions } from 'redux/register'
import Avatar from 'ui/Avatar'
import CardTooltip from 'ui/CardTooltip'
import Button from 'ui/Button'
import Popover from 'ui/Popover'
import { authInProgress, isLoggedIn } from 'selectors/auth'

class AccountMenuTooltip extends Component {
  render () {
    return (
      <CardTooltip.Popover
        {...this.props}
        style={{
          ...this.props.style,
          paddingTop: 4,
          paddingRight: 8,
          paddingBottom: 4,
          paddingLeft: 8
        }}
      >
        <CardTooltip.LineButton>
          <Link to='/pages'>
            Pages
          </Link>
        </CardTooltip.LineButton>
        <CardTooltip.LineButton
          onClick={this.handleEditProfile}
          label='Account Settings'
        />
        <CardTooltip.LineButton>
          <a
            target='_blank'
            rel='noopener'
            href='https://sideway.freshdesk.com/support/tickets/new'
          >
            Support
          </a>
        </CardTooltip.LineButton>
        <CardTooltip.LineButton onClick={this.handleLogout} label='Sign out' />
      </CardTooltip.Popover>
    )
  }

  handleLogout = () => {
    const { dispatch } = this.props
    dispatch(authActions.logout())
  };

  handleEditProfile = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'modal/SHOW',
      payload: { modal: 'accountDetails', data: window.location.pathname }
    })
  };
}

class AccountMenuItem extends Component {
  render () {
    const { dispatch, profile } = this.props

    return (
      <Popover
        animate={false}
        component='div'
        openOnClick
        arrowSize={8}
        edgeBuffer={8}
        popoverComponent={AccountMenuTooltip}
        popoverProps={{
          dispatch,
          profile
        }}
      >
        <Avatar size='large' user={profile} />
      </Popover>
    )
  }
}

class NavLinks extends Component {
  render () {
    const { authActive, loggedIn } = this.props

    if (authActive) {
      return null
    }

    return loggedIn ? this.renderLoggedInLinks() : this.renderLoggedOutLinks()
  }

  renderLoggedOutLinks () {
    const { register = {} } = this.props
    const hasRegisterData = !!register.registerData.network

    return (
      <nav className={css(styles.navLinks)}>
        {hasRegisterData
          ? <Button
            color='brandgreen'
            label='complete registration'
            textOnly
            onClick={this.handleRegister}
            >
              Complete Registration
            </Button>
          : <Button
            color='brandgreen'
            label='Sign In'
            textOnly
            onClick={this.handleLogin}
            >
              Sign In
            </Button>}
      </nav>
    )
  }

  renderLoggedInLinks () {
    const { dispatch, profile } = this.props

    if (!profile.id) {
      return null
    }

    return (
      <nav className={css(styles.navLinks)}>
        <AccountMenuItem dispatch={dispatch} profile={profile} />
      </nav>
    )
  }

  handleLogin = () => {
    const { dispatch } = this.props

    dispatch({
      type: 'modal/SHOW',
      payload: { modal: 'login', data: { nextState: window.location.pathname } }
    })
  };

  handleRegister = () => {
    const { dispatch, profile } = this.props

    if (profile && profile.id) {
      dispatch(registerActions.setRegisterData(profile))
    }

    dispatch({ type: 'modal/SHOW', payload: { modal: 'register' } })
  };
}

const styles = StyleSheet.create({
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    cursor: 'pointer'
  }
})

const mapStateToProps = state => {
  return {
    profile: state.profile,
    authActive: authInProgress(state),
    loggedIn: isLoggedIn(state),
    register: state.register
  }
}

export default connect(mapStateToProps)(NavLinks)
