import { Component } from 'react'
import { connect } from 'react-redux'
import { debounce } from 'lodash'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font, forms } from 'style'
import ProviderButton from 'ui/ProviderButton'
import { isEmail } from 'utils/form'
import LogoFull from 'art/LogoFull'
import Button from 'ui/Button'
import FieldStatus from 'forms/FieldStatus'
import InputField from 'forms/InputField'
import { api } from 'api'

class LoginForm extends Component {
  static defaultProps = {
    nextState: '/',
    hideUsername: false
  };

  state = {
    account: { value: '' },
    error: null,
    submitting: false,
    success: null
  };

  render () {
    const { account, error, submitting, success } = this.state
    const { nextState, sessionExpired, hideUsername } = this.props

    return (
      <div className={css(styles.wrapper)}>
        <LogoFull className={css(styles.logo)} />
        {sessionExpired &&
          <legend className={css(styles.expNotice)}>
            Your session expired
          </legend>}
        <ProviderButton
          style={{ width: '100%' }}
          provider='twitter'
          nextState={nextState}
        >
          Sign In with Twitter
        </ProviderButton>
        <p className={css(styles.meta)}>
          OR
        </p>
        <form className={css(styles.form)} onSubmit={this.handleSubmit}>
          <label className={css(styles.inputWrapper)}>
            {
              // !hideUsername && 'Using magic sign-in link',
              <div>
                <InputField
                  name='account'
                  onChange={this.handleAccountChange}
                  loading={account.loading}
                  value={account.value}
                  placeholder={hideUsername ? 'Email' : 'Email or Username'}
                  autoComplete='email'
                  autoCorrect='off'
                  autoCapitalize='none'
                  spellCheck={false}
                >
                  {!hideUsername &&
                    <FieldStatus
                      value={account.value}
                      initialValue=''
                      success={account.accountFound === true && 'we found you!'}
                      error={account.accountFound === false && 'not found'}
                    />}
                </InputField>
              </div>
            }
          </label>
          {error &&
            <div className={css(styles.error)}>
              {error}
            </div>}
          {success &&
            <div className={css(styles.success)}>
              {success}
            </div>}
          <Button
            type='submit'
            color='brandgreen'
            label='Send Link'
            disabled={submitting}
            style={{
              width: '100%'
            }}
            data-ga-on='click'
            data-ga-event-category='sign-up'
            data-ga-event-action='email-link-click'
          >
            Send Magic Link
          </Button>
        </form>
      </div>
    )
  }

  handleAccountChange = e => {
    const { value } = e.target
    this.handleAccountLookup(value)
    this.setState({
      account: { ...this.state.account, value, error: false },
      error: null,
      success: null
    })
  };

  handleAccountLookup = debounce(
    value => {
      const { account } = this.state
      const { hideUsername } = this.props
      const valueIsEmail = isEmail(value)

      if (
        value.length < 3 ||
        value !== this.state.account.value ||
        (valueIsEmail && hideUsername)
      ) {
        return
      }

      this.setState({
        account: { ...account, loading: true, accountFound: null }
      })

      api(
        `/user/lookup/${valueIsEmail ? 'email' : 'username'}/${value}`
      ).then(res => {
        if (!res.ok) {
          return this.setState({
            account: { ...account, accountFound: false, loading: false }
          })
        }

        this.setState({
          account: { ...account, accountFound: true, loading: false }
        })
      })
    },
    500
  );

  handleSubmit = async e => {
    const { account } = this.state
    const { nextState, hideUsername } = this.props

    e.preventDefault()

    if (!account.value) {
      return
    }

    let redirect = nextState || window.location.pathname
    if (redirect.includes('error') || redirect === '/500') {
      redirect = '/'
    }

    this.setState({ submitting: true })

    const req = {
      path: '/user/reminder',
      method: 'post',
      payload: {
        account: account.value,
        state: redirect
      }
    }

    if (hideUsername) {
      req.payload.signup = true
    }

    let res
    try {
      res = await api(req)
    } catch (e) {
      return this.setState({
        submitting: false,
        error: 'There was an error. Please try again.',
        success: null
      })
    }

    if (!res.ok) {
      return this.setState({
        submitting: false,
        error: "We couldn't find that account",
        success: null
      })
    }

    this.setState({
      account: { value: '' },
      submitting: false,
      error: null,
      success: "We've sent you a link to sign in"
    })
  };
}

const mapStateToProps = (state, props) => {
  return { auth: state.auth }
}

export default connect(mapStateToProps, null, null, { pure: false })(LoginForm)

const styles = StyleSheet.create({
  wrapper: {
    ...forms.form,
    alignItems: 'center'
  },
  form: {
    ...forms.form,
    alignItems: 'center'
  },
  logo: {
    height: 88,
    // width: '75%',
    alignSelf: 'center',
    marginBottom: 32
  },
  inputWrapper: {
    width: '100%'
  },
  error: {
    ...forms.errorMessage,
    padding: 4,
    textAlign: 'center'
  },
  success: {
    ...forms.errorMessage,
    padding: 4,
    textAlign: 'center',
    color: colors.midgreen
  },
  expNotice: {
    ...forms.inputWrapper,
    marginBottom: 16,
    color: colors.brandgreen,
    fontWeight: 400
  },
  meta: {
    ...font.body1,
    color: colors.lightgray,
    textAlign: 'center',
    marginTop: 16,
    marginRight: 0,
    marginBottom: 16,
    ':before': {
      content: "'— '"
    },
    ':after': {
      content: "' —'"
    }
  },
  registerLink: {
    marginTop: 16,
    ':before': {
      content: "'— '",
      display: 'block',
      width: '100%',
      color: colors.lightgray,
      textAlign: 'center'
    }
  }
})
