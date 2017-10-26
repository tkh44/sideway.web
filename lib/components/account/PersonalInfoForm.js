import { Component } from 'react'
import { validateName, validateUsername } from 'utils/form'
import { debounce, get } from 'lodash'
import { css, StyleSheet } from 'aphrodite/no-important'
import { forms } from 'style'
import ProfileSection from 'account/ProfileSection'
import Confirm from 'ui/Confirm'
import Button from 'ui/Button'
import InputField from 'forms/InputField'
import FieldStatus from 'forms/FieldStatus'
import { profileActions } from 'redux/profile'
import { api } from 'api'

export default class PersonalInfoForm extends Component {
  constructor (props, context) {
    super(props, context)

    this.state = {
      confirming: false,
      error: false,
      formRect: { width: 0, height: 0 },
      confirmationStyles: {},
      name: { value: props.profile.name || '' },
      username: { value: props.profile.username || '' }
    }
  }

  componentDidMount () {
    const { dispatch } = this.props

    dispatch(profileActions.getProfile()) // Make sure we have profile subscribed
  }

  render () {
    return (
      <ProfileSection title='Basic Info' showTopBorder={false}>
        {this.state.confirming && this.renderConfirmation()}
        {this.renderForm()}
      </ProfileSection>
    )
  }

  renderConfirmation () {
    const { submitting } = this.state

    return (
      <Confirm
        style={this.state.formRect}
        message='Changing your username or name will immediately affect how your account is displayed to others.'
        cancelText='Cancel'
        confirmText='Update Profile'
        cancelButtonColor='gray'
        confirmButtonColor='brandgreen'
        loading={submitting}
        onCancel={this.handleFormReset}
        onConfirm={this.handleSubmit}
      />
    )
  }

  renderForm () {
    const { name, username } = this.state
    const { profile } = this.props

    return (
      <form
        ref={el => {
          this.formEl = el
        }}
        style={{ display: this.state.confirming ? 'none' : 'flex' }}
        className={css(styles.form)}
        onSubmit={this.handlePreSave}
      >
        <InputField
          value={name.value}
          error={name.error}
          label='Name'
          name='name'
          initialValue={profile.name}
          onChange={this.handleNameChange}
          placeholder='Name'
          spellCheck={false}
          required
        />
        <InputField
          value={username.value}
          loading={username.loading}
          error={username.error}
          label='Username'
          name='username'
          placeholder='Username'
          initialValue={profile.username}
          onChange={this.handleUsernameChange}
          autoCorrect='off'
          autoCapitalize='off'
          spellCheck={false}
          required
        >
          <FieldStatus
            value={username.value}
            initialValue={profile.username}
            success={username.available === true && 'Available'}
            error={
              username.error
                ? username.error
                : username.available === false && 'Taken'
            }
          />
        </InputField>
        {this.state.error &&
          <div className={css(styles.errorMessage)}>
            {this.state.error}
          </div>}
        <Button
          color='brandgreen'
          label='Update Your Profile'
          tooltip
          onClick={this.handlePreSave}
        >
          Save Changes
        </Button>
      </form>
    )
  }

  handleNameChange = e => {
    const { value } = e.target
    this.setState({
      name: { ...this.state.name, value, error: null },
      error: null
    })
  };

  handleUsernameChange = e => {
    const { value } = e.target
    this.setState({
      username: { ...this.state.username, value, error: null },
      error: null
    })
    this.handleUsernameLookup(value)
  };

  handleUsernameLookup = debounce(
    value => {
      const { profile } = this.props

      if (value.length === 0) {
        return
      }

      if (
        value.length > 3 &&
        (value === profile.username || value !== this.state.username.value)
      ) {
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

  handlePreSave = e => {
    e.preventDefault()

    if (
      !this.validateForm() ||
      (this.state.username.value === this.props.profile.username &&
        this.state.name.value === this.props.profile.name)
    ) {
      return
    }

    this.setState({
      confirming: true,
      formRect: this.calculateConfirmationStyles()
    })
  };

  handleSubmit = e => {
    const { username, name } = this.state
    const { dispatch } = this.props

    e.preventDefault()
    this.setState({ submitting: true })

    dispatch(
      profileActions.patchProfile({
        username: username.value,
        name: name.value
      })
    ).then(res => {
      if (!res.ok) {
        const errorMessage = get(res, 'data.message', '')
        let message = 'We had some trouble updating your profile.  Please try again.'
        if (errorMessage === 'Already taken') {
          message = 'Username is already taken'
        } else if (errorMessage === 'Reserved keyword') {
          message = 'Username is not allowed'
        }

        this.setState({ submitting: false, confirming: false, error: message })
        return
      }

      this.handleFormReset()
    })
  };

  handleFormReset = e => {
    const { profile } = this.props

    e && e.preventDefault()

    this.setState({
      submitting: false,
      confirming: false,
      name: { value: profile.name },
      username: { value: profile.username },
      error: false
    })
  };

  validateForm () {
    const { name, username } = this.state
    const nameError = validateName(name.value)
    const usernameError = validateUsername(username.value)

    this.setState({
      name: { ...name, error: nameError },
      username: { ...username, error: usernameError }
    })

    return !(nameError || usernameError)
  }

  calculateConfirmationStyles () {
    if (!this.formEl) {
      return { height: 0, width: 0 }
    }

    return this.formEl.getBoundingClientRect()
  }
}

const styles = StyleSheet.create({
  form: {
    ...forms.form
  },
  errorMessage: {
    ...forms.errorMessage,
    textAlign: 'center'
  }
})
