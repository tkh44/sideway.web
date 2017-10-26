import { Component } from 'react'
import { debounce, get } from 'lodash'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, forms } from 'style'
import ProfileSection from 'account/ProfileSection'
import Button from 'ui/Button'
import InputField from 'forms/InputField'
import FieldStatus from 'forms/FieldStatus'
import { authActions } from 'redux/auth'
import { profileActions } from 'redux/profile'
import { api } from 'api'

const INVITE_SUCCESS_COPY = 'Awesome!'

export default class InviteForm extends Component {
  state = {
    submitting: false,
    success: null,
    error: null,
    promo: { value: '' }
  };

  render () {
    return (
      <ProfileSection title='Promo' showTopBorder>
        {this.renderForm()}
      </ProfileSection>
    )
  }

  renderForm () {
    const { error, promo, submitting, success } = this.state

    return (
      <div>
        <form className={css(styles.form)} onSubmit={this.handleSubmit}>
          <InputField
            ref={el => {
              this.inviteFieldEl = el
            }}
            value={promo.value}
            error={promo.error}
            initialValue=''
            isInline
            onChange={this.handleInviteChange}
            name='promo'
            placeholder='Promo Code'
            autoCorrect='off'
            autoCapitalize='off'
            spellCheck={false}
          >
            <FieldStatus
              success={promo.validInvite === true && 'perfect!'}
              error={promo.validInvite === false && 'invalid'}
            />
          </InputField>
          <Button
            color={
              error ? 'red' : promo.validInvite ? 'brandgreen' : 'darkgray'
            }
            isInline
            disabled={submitting}
            onClick={this.handleSubmit}
            label='Apply Promo'
          >
            Apply
          </Button>
        </form>
        <div className={css(styles.success)}>
          {success}
        </div>
        <div className={css(styles.error)}>
          {error}
        </div>
      </div>
    )
  }

  handleInviteChange = e => {
    const { value } = e.target

    this.debouncedInviteLookup(value)
    this.setState({
      success: null,
      error: null,
      promo: { ...this.state.promo, value, error: false }
    })
  };

  handleInviteLookup = value => {
    const { promo } = this.state

    if (!value.length || value !== this.state.promo.value) {
      return
    }

    this.setState({ promo: { ...promo, loading: true, validInvite: null } })

    api(`/invite/${value}`).then(res => {
      if (res.ok) {
        return this.setState({
          promo: { ...promo, loading: false, validInvite: true }
        })
      }

      this.setState({
        promo: { ...promo, loading: false, validInvite: false }
      })
    })
  };

  handleSubmit = e => {
    const { promo } = this.state

    e.preventDefault()

    if (promo.value && promo.value.length) {
      this.setState({ submitting: true })
      return this.handleInviteUpdateSubmit(promo.value)
    }
  };

  async handleInviteUpdateSubmit (inviteCode) {
    const { dispatch } = this.props

    try {
      const updateScopeRes = await dispatch(
        profileActions.updateScope(inviteCode)
      )

      if (!updateScopeRes.ok) {
        return this.onInviteUpdateError(inviteCode)
      }

      const rsvp = get(updateScopeRes, 'data.rsvp')
      if (rsvp) await dispatch(authActions.getUserTicket(rsvp))

      this.setState({ success: INVITE_SUCCESS_COPY, error: null })
      this.handleFormReset()
    } catch (e) {
      this.onInviteUpdateError(inviteCode)
    }
  }

  onInviteUpdateError (inviteCode) {
    this.setState({
      submitting: false,
      success: null,
      error: `${inviteCode} is not a valid promo.  Please try again.`
    })
  }

  handleFormReset = () =>
    this.setState({ submitting: false, promo: { value: '' } });

  debouncedInviteLookup = debounce(this.handleInviteLookup, 500);
}

const styles = StyleSheet.create({
  form: {
    ...forms.inlineForm
  },
  error: {
    ...forms.errorMessage,
    padding: 2
  },
  success: {
    ...forms.errorMessage,
    padding: 2,
    color: colors.midgreen
  }
})
