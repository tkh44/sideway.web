import { Component } from 'react'
import { connect } from 'react-redux'
import { debounce } from 'lodash'
import { css, StyleSheet } from 'aphrodite/no-important'
import { font, forms } from 'style'
import Button from 'ui/Button'
import InputField from 'forms/InputField'
import FieldStatus from 'forms/FieldStatus'
import { checkEmailAddress, validateUsername } from 'utils/form'
import { sitrep } from 'redux/sitrep'
import { authActions } from 'redux/auth'
import { profileActions } from 'redux/profile'
import { registerActions } from 'redux/register'
import { api } from 'api'
import { isLoggedIn } from 'selectors/auth'

class RegisterForm extends Component {
  constructor (props) {
    super(props)

    this.state = {
      submitting: false,
      username: { value: props.initialValues.username || '' },
      name: { value: props.initialValues.name || '' },
      email: { value: props.initialValues.email || '' },
      network: { value: props.initialValues.network }
    }
  }

  componentDidMount () {
    if (this.state.username.value && this.state.username.value.length) {
      this.handleUsernameLookup(this.state.username.value)
    }
  }

  componentWillUnmount () {
    this.handleUsernameLookup.cancel()
  }

  render () {
    const { loggedIn } = this.props

    return loggedIn
      ? this.renderLoggedInRegistration()
      : this.renderSignupRegistration()
  }

  renderSignupRegistration () {
    const { error, username, name, email, submitting } = this.state
    const { initialValues } = this.props

    return (
      <form className={css(styles.form)} onSubmit={this.handleSubmit}>
        <h3 className={css(styles.welcome)}>
          Welcome to Sideway!
        </h3>
        <InputField
          onChange={this.handleUsernameChange}
          value={username.value}
          error={username.error}
          initialValue={initialValues.username}
          name='username'
          placeholder='Username'
          label='Username'
          autoComplete='username'
          autoCorrect='off'
          autoCapitalize='none'
          spellCheck={false}
          required
        >
          <FieldStatus
            value={username.value}
            initialValue={initialValues.username}
            loading={username.loading}
            success={username.available === true && 'available'}
            error={
              username.error
                ? username.error
                : username.available === false && 'taken'
            }
          />
        </InputField>
        <InputField
          {...email}
          value={email.value}
          onChange={this.handleFieldChange}
          initialValue={initialValues.email}
          name='email'
          type='email'
          placeholder='Email'
          label='Email'
          autoComplete='email'
          spellCheck={false}
          required
        />
        <InputField
          {...name}
          onChange={this.handleFieldChange}
          initialValue={initialValues.name}
          name='name'
          label='Name'
          placeholder='Name'
          autoComplete='name'
          spellCheck={false}
          required
        />
        {error &&
          <div className={css(styles.error)}>
            {error}
          </div>}
        <Button
          style={{ marginTop: 16 }}
          color='brandgreen'
          type='submit'
          label='Complete Sign Up'
          disabled={submitting}
        >
          Sign Up
        </Button>
      </form>
    )
  }

  renderLoggedInRegistration () {
    const { error, username, name, email, submitting } = this.state
    const { initialValues } = this.props

    return (
      <form className={css(styles.form)} onSubmit={this.handleSubmit}>
        <h3 className={css(styles.welcome)}>
          Welcome to Sideway!
        </h3>
        {!initialValues.username &&
          <InputField
            onChange={this.handleUsernameChange}
            value={username.value}
            error={username.error}
            initialValue={initialValues.username}
            name='username'
            placeholder='Username'
            label='Username'
            autoComplete='username'
            autoCorrect='off'
            autoCapitalize='none'
            spellCheck={false}
            required
          >
            <FieldStatus
              value={username.value}
              initialValue={initialValues.username}
              loading={username.loading}
              success={username.available === true && 'available'}
              error={
                username.error
                  ? username.error
                  : username.available === false && 'taken'
              }
            />
          </InputField>}
        {!initialValues.email &&
          <InputField
            {...email}
            onChange={this.handleFieldChange}
            initialValue={initialValues.email}
            name='email'
            type='email'
            autoComplete='email'
            placeholder='Email'
            label='Email'
            spellCheck={false}
            required
          />}
        {!initialValues.name &&
          <InputField
            {...name}
            onChange={this.handleFieldChange}
            initialValue={initialValues.name}
            name='name'
            autoComplete='name'
            label='Name'
            placeholder='Name'
            spellCheck={false}
            required
          />}
        {error &&
          <div className={css(styles.error)}>
            {error}
          </div>}
        <Button
          style={{ marginTop: 16 }}
          color='brandgreen'
          type='submit'
          label='Complete Registration'
          tooltip
          disabled={submitting}
        >
          Complete
        </Button>
      </form>
    )
  }

  handleFieldChange = e => {
    const { value, name: fieldName } = e.target
    this.setState({
      [fieldName]: { ...this.state[fieldName], value, error: false },
      error: null
    })
  };

  handleUsernameChange = e => {
    const { value } = e.target
    const error = validateUsername(value)
    this.setState({
      username: { ...this.state.username, value, error },
      error: null
    })

    if (!error) {
      this.handleUsernameLookup(value)
    }
  };

  handleUsernameLookup = debounce(
    value => {
      if (value !== this.state.username.value) {
        return
      }

      api(`/user/lookup/username/${value}`).then(res => {
        if (!res.ok) {
          if (res.status !== 404) {
            this.setState({
              username: {
                ...this.state.username,
                available: null,
                loading: false
              }
            })
          }

          if (res.status === 404 && this.state.username.value === value) {
            this.setState({
              username: {
                ...this.state.username,
                available: true,
                loading: false
              }
            })
          }

          return
        }

        this.setState({
          username: { ...this.state.username, available: false, loading: false }
        })
      })
    },
    500
  );

  handleSubmit = e => {
    e.preventDefault()

    const { username, name, email, network } = this.state
    const { loggedIn } = this.props

    if (loggedIn) {
      return this.loggedInRegistration()
    }

    this.setState({ submitting: true, error: null })
    this.createAccount({
      username: username.value,
      name: name.value,
      email: email.value,
      network: network.value
    })
  };

  createAccount (payload) {
    const { dispatch } = this.props

    dispatch(profileActions.create(payload))
      .then(res => {
        if (!res.ok) {
          return this.profileCreateError(res)
        }

        this.profileCreateSuccess(res, payload)
      })
      .catch(err => {
        this.profileCreateError(err)
      })
  }

  profileCreateSuccess (res, payload) {
    const { dispatch } = this.props

    dispatch(
      sitrep.success({
        message: `Welcome to Sideway! \nWe've sent a link to verify your email to ${payload.email}.`,
        duration: 4000
      })
    )

    dispatch({ type: 'modal/HIDE', payload: { modal: 'register' } })
    dispatch(registerActions.clearRegisterData())

    this.authorizeAccount(res.data.rsvp)
  }

  profileCreateError (res) {
    const { message, errors } = this.parseErrorResponse(res.data)

    this.setState({
      ...Object.keys(errors).reduce(
        (accum, key) => {
          accum[key] = { ...this.state[key], error: errors[key] }
          return accum
        },
        {}
      ),
      error: message,
      submitting: false
    })
  }

  authorizeAccount (rsvp) {
    const { dispatch } = this.props
    return dispatch(authActions.initAuth(rsvp))
  }

  loggedInRegistration (values) {
    const { dispatch, profile } = this.props
    const { username, name, email } = this.state

    const cleanup = res => {
      if (!res.ok) {
        return this.setState({
          submitting: false,
          email: { ...email, error: res.data.message }
        })
      }

      dispatch({ type: 'modal/HIDE', payload: { modal: 'register' } })

      dispatch(profileActions.getProfile()).then(patchRes => {
        dispatch(profileActions.putData('registrationComplete', true))
        dispatch(registerActions.clearRegisterData())
      })
    }

    return dispatch(
      profileActions.patchProfile({
        name: name.value,
        username: username.value
      })
    ).then(res => {
      if (!res.ok) {
        const { message, errors } = this.parseErrorResponse(res.data)

        return this.setState({
          ...Object.keys(errors).reduce(
            (accum, key) => {
              accum[key] = { ...this.state[key], error: errors[key] }
              return accum
            },
            {}
          ),
          error: message
        })
      }

      if (email.value && !profile.emails[email.value]) {
        return dispatch(profileActions.addEmail(email.value)).then(cleanup)
      }

      return cleanup(res)
    })
  }

  validate () {
    const { username, name, email } = this.state
    const errors = {}
    errors.username = validateUsername(username.value)

    if (!name.value) {
      errors.name = true
    }

    const emailError = checkEmailAddress(email)

    if (!email.value || emailError) {
      errors.email = true
    }

    this.setState({
      name: { ...name, error: errors.name },
      username: { ...username, error: errors.username },
      email: { ...email, error: errors.email }
    })

    if (Object.keys(errors).length) {
      return false
    }
  }

  parseErrorResponse (errData) {
    const { username, email } = this.state
    const errors = {}
    let message = 'Whoops! Something went wrong on our end.  Please try again.'

    if (errData && errData.message) {
      switch (errData.message.toLowerCase()) {
        case 'already taken':
          message = `"${username.value}" is unavailable`
          errors.username = true
          break

        case 'email address already linked to an existing user':
          message = `${email.value} is already linked to an existing user`
          errors.email = true
          break

        case 'twitter account already linked to an existing user':
          message = 'Twitter account already linked to an existing user'
          break

        default:
          message = 'Whoops! Something went wrong on our end.  Please try again.'
      }
    }

    return { errors, message }
  }
}

const mapStateToProps = (state, props) => {
  const initialValues = state.register.registerData

  return {
    loggedIn: isLoggedIn(state),
    profile: state.profile,
    register: state.register,
    initialValues
  }
}

export default connect(mapStateToProps, null, null, { pure: false })(
  RegisterForm
)

const styles = StyleSheet.create({
  form: {
    ...forms.form,
    paddingTop: 32
  },
  welcome: {
    ...font.display1,
    marginBottom: 16,
    fontWeight: 300,
    textAlign: 'center'
  },
  error: {
    ...forms.errorMessage,
    padding: 4,
    textAlign: 'center'
  }
})
