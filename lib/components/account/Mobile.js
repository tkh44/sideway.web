import { Component } from 'react'
import { get } from 'lodash'
import { css, StyleSheet } from 'aphrodite/no-important'
import InputField from 'forms/InputField'
import { colors, font } from 'style'
import ProfileSection from 'account/ProfileSection'
import SelectBox from 'ui/SelectBox'
import Button from 'ui/Button'
import { profileActions } from 'redux/profile'
import { sitrep } from 'redux/sitrep'
import { cleanPhoneNumber } from 'utils/form'

class MobileDisplay extends Component {
  render () {
    const { onUpdateClick, profile, style } = this.props
    const mobile = get(profile, 'mobile', {})

    return (
      <div className={css(styles.mobileDisplay)} style={style}>
        <span className={css(styles.mobileNumber)}>
          {mobile.display}
        </span>
        <Button
          color='brandgreen'
          textOnly
          label='Update Mobile'
          onClick={onUpdateClick}
        >
          Update
        </Button>
        <Button
          color='red'
          style={{
            marginLeft: 8
          }}
          textOnly
          label='Remove Mobile'
          onClick={this.handleDeleteClick}
        >
          Remove
        </Button>
      </div>
    )
  }

  handleDeleteClick = async () => {
    const { dispatch } = this.props
    this.setState({ deleting: true })
    const { ok } = await dispatch(profileActions.deleteMobile())

    if (ok) {
      dispatch(sitrep.success('You mobile number has been removed'))
      return
    }

    this.setState({
      deleting: false,
      deleteError: 'We could not remove your number at this time'
    })
  };
}

class NumberForm extends Component {
  constructor (props) {
    super(props)
    const profile = props.profile
    this.state = {
      number: cleanPhoneNumber(get(profile, 'mobile.number', '')),
      country: get(profile, 'mobile.contry', 'us'),
      submitting: false,
      formError: ''
    }
  }

  componentWillReceiveProps (nextProps) {
    const number = get(this.props, 'profile.mobile.number')
    const country = get(this.props, 'profile.mobile.country')
    const nextNumber = get(nextProps, 'profile.mobile.number')
    const nextCountry = get(nextProps, 'profile.mobile.country')

    if (number !== nextNumber || country !== nextCountry) {
      this.setState({
        country: nextCountry,
        number: nextNumber.replace(/^\+\d/, '')
      })
    }
  }

  render () {
    const {
      number,
      country,
      formError,
      submitting
    } = this.state
    const { onCancelClick, showCancelButton, style } = this.props

    return (
      <form
        className={css(styles.mobileForm)}
        style={style}
        onSubmit={this.handleSubmit}
      >
        <div className={css(styles.countryNotice)}>
          Only U.S.A. and Canada are supported at this time
        </div>
        <div className={css(styles.inputWrapper)}>
          <SelectBox
            style={{
              width: 98,
              marginRight: 8,
              flex: 'none'
            }}
            value={country}
            onChange={this.handleCountryChange}
            options={[
              { label: 'U.S.A.', value: 'us' },
              { label: 'Canada', value: 'ca' }
            ]}
            placeholder='Country'
            required
            aria-label='country'
          />
          <InputField
            value={number}
            name='number'
            onChange={this.handleNumberChange}
            type='tel'
            isInline
            className={css(styles.input)}
            placeholder='Mobile Phone Number'
            required
            aria-label='mobile number'
          />
        </div>
        {formError &&
          <div className={css(styles.mobileError)}>
            <span>
              {formError}
            </span>
          </div>}
        <div className={css(styles.buttonRow)}>
          {showCancelButton &&
            <Button
              type='reset'
              style={{}}
              label='Cancel'
              onClick={onCancelClick}
            >
              Cancel
            </Button>}
          <Button
            color='brandgreen'
            type='submit'
            style={{
              marginLeft: showCancelButton ? 16 : 0,
              flex: 1
            }}
            label={showCancelButton ? 'Update Mobile' : 'Save Mobile'}
            disabled={submitting}
          >
            {showCancelButton ? 'Update Mobile' : 'Save Mobile'}
          </Button>
        </div>
      </form>
    )
  }

  handleNumberChange = e => {
    this.setState({ number: e.target.value, formError: '' })
  };

  handleCountryChange = ({ value }) => {
    this.setState({ country: value })
  };

  handleSubmit = async e => {
    e.preventDefault()
    const { number, country } = this.state
    const { dispatch, onSuccess, profile } = this.props
    const cleanNumber = cleanPhoneNumber(number)

    if (cleanNumber === cleanPhoneNumber(get(profile, 'mobile.number', ''))) {
      return this.setState({
        formError: `${cleanNumber} is already assigned to your account`
      })
    }

    this.setState({ submitting: true })

    const { ok, data } = await dispatch(
      profileActions.updateMobile({
        number: cleanNumber,
        country: country
      })
    )

    if (ok) {
      return this.setState(
        {
          formError: '',
          submitting: false
        },
        onSuccess
      )
    }

    const message = get(data, 'message', '')

    this.setState(
      {
        formError: message,
        submitting: false
      },
      () => {
        if (ok) {
          onSuccess()
        }
      }
    )
  };
}

class VerifyForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      code: '',
      submitting: false,
      formError: ''
    }
  }

  render () {
    const { code, style, submitting, formError } = this.state

    return (
      <form style={style} onSubmit={this.handleSubmit}>
        <div className={css(styles.inputWrapper)}>
          <InputField
            value={code}
            name='code'
            onChange={this.handleCodeChange}
            type='tel'
            className={css(styles.input)}
            isInline
            placeholder='Verification Code'
            required
            aria-label='Verification Code'
          />
          <Button
            color='brandgreen'
            type='submit'
            isInline
            disabled={submitting}
            label
          >
            Verify
          </Button>
        </div>
        {formError &&
          <div className={css(styles.mobileError)}>
            <span>
              {formError}
            </span>
          </div>}
      </form>
    )
  }

  handleCodeChange = e => {
    this.setState({ code: e.target.value, formError: '' })
  };

  handleSubmit = async e => {
    e.preventDefault()
    const { code } = this.state
    const { dispatch, onSuccess } = this.props
    const { ok, data } = await dispatch(profileActions.verifyMobile(code))

    if (ok) {
      dispatch(sitrep.success('You mobile number has been verified!'))

      this.setState({ submitting: false }, onSuccess)
    } else {
      this.setState({
        submitting: false,
        formError: get(
          data,
          'message',
          'We could not verify your number at this time'
        )
      })
    }
  };
}

export default class Mobile extends Component {
  constructor (props) {
    super(props)
    const hasNumber = !!get(props.profile, 'mobile.number', '')
    this.state = {
      hasNumber: hasNumber,
      showDisplay: hasNumber,
      showNumberForm: !hasNumber,
      showVerifyForm: false
    }
  }

  componentWillReceiveProps (nextProps) {
    const number = get(this.props, 'profile.mobile.number')
    const country = get(this.props, 'profile.mobile.country')
    const nextNumber = get(nextProps, 'profile.mobile.number')
    const nextCountry = get(nextProps, 'profile.mobile.country')

    if (number !== nextNumber || country !== nextCountry) {
      const hasNumber = !!nextNumber
      this.setState({
        hasNumber: hasNumber,
        showDisplay: hasNumber,
        showNumberForm: !hasNumber,
        showVerifyForm: false
      })
    }
  }

  render () {
    const {
      showDisplay,
      showNumberForm,
      showVerifyForm
    } = this.state
    const { profile, dispatch } = this.props
    const hasNumber = !!get(profile, 'mobile.number', '')

    return (
      <ProfileSection
        title='Mobile'
        showTopBorder
        className={css(styles.timeWrapper)}
      >
        {showDisplay &&
          <MobileDisplay
            key='display'
            dispatch={dispatch}
            profile={profile}
            onUpdateClick={this.handleStartUpdate}
          />}
        {showNumberForm &&
          <NumberForm
            key='number'
            dispatch={dispatch}
            onCancelClick={this.handleReset}
            onSuccess={this.handleUpdateSuccess}
            profile={profile}
            showCancelButton={hasNumber}
          />}
        {showVerifyForm &&
          <VerifyForm
            key='verify'
            dispatch={dispatch}
            onSuccess={this.handleReset}
          />}
      </ProfileSection>
    )
  }

  handleStartUpdate = () => {
    this.setState({
      showDisplay: false,
      showNumberForm: true,
      showVerifyForm: false
    })
  };

  handleUpdateSuccess = () => {
    this.setState({ showNumberForm: false, showVerifyForm: true })
  };

  handleReset = () => {
    this.setState({
      showDisplay: true,
      showNumberForm: false,
      showVerifyForm: false
    })
  };
}

const styles = StyleSheet.create({
  mobileDisplay: {
    display: 'flex',
    alignItems: 'center'
  },
  mobileNumber: {
    flex: 1
  },
  mobileForm: {},
  buttonRow: {
    display: 'flex'
  },
  verifyForm: {
    display: 'flex'
  },
  countryNotice: {
    ...font.caption,
    color: colors.lightgray,
    paddingTop: 4,
    paddingBottom: 4
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 16
  },
  input: {
    flex: 1
  },
  mobileError: {
    ...font.caption,
    color: colors.red,
    paddingBottom: 8
  }
})
