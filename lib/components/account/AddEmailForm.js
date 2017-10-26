import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { forms } from 'style'
import { checkEmailAddress } from 'utils/form'
import Button from 'ui/Button'
import InputField from 'forms/InputField'
import { profileActions } from 'redux/profile'

export default class AddEmailForm extends Component {
  state = {
    email: '',
    error: null,
    submitting: false
  };

  render () {
    const { email, error, submitting } = this.state

    return (
      <div>
        <form className={css(styles.form)} onSubmit={this.handleSubmit}>
          <InputField
            value={email}
            error={error}
            onChange={this.handleEmailChange}
            initialValue=''
            isInline
            name='email'
            type='email'
            autoComplete='email'
            placeholder='New Email'
            spellCheck={false}
          />
          <Button
            color={
              error
                ? 'red'
                : !checkEmailAddress(email) ? 'brandgreen' : 'darkgray'
            }
            isInline
            type='submit'
            label='Add Email'
            disabled={submitting}
          >
            Add
          </Button>
        </form>
        {error &&
          <div className={css(styles.error)}>
            {error}
          </div>}
      </div>
    )
  }

  handleEmailChange = e => {
    const { value } = e.target
    this.setState({ email: value, error: null })
  };

  handleSubmit = async e => {
    const { email } = this.state
    const { dispatch } = this.props

    e.preventDefault()

    if (!email) {
      return
    }

    const emailError = checkEmailAddress(email)
    if (emailError) {
      return this.setState({ error: emailError })
    }

    this.setState({ submitting: true, error: null })

    const res = await dispatch(profileActions.addEmail(email))

    if (!res.ok) {
      let errorMessage = res.data.message

      if (res.status === 0) {
        errorMessage = 'We could not add your email at this time.'
      }

      console.log(errorMessage)
      return this.setState({ submitting: false, error: errorMessage })
    }

    this.setState({ email: '', error: null, submitting: false })
  };
}

const styles = StyleSheet.create({
  form: {
    ...forms.inlineForm
  },
  error: {
    ...forms.errorMessage,
    padding: 2
  }
})
