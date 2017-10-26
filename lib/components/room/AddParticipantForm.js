import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import Button from 'ui/Button'
import Icon from 'art/Icon'
import { roomActions } from 'redux/rooms'
import { sitrep } from 'redux/sitrep'
import { colors, font } from 'style'

const TWITTER = 'twitter'
const SIDEWAY = 'sideway'
const EMAIL = 'email'

const typeMap = {
  [TWITTER]: {
    placeholder: 'Username'
  },
  [SIDEWAY]: {
    placeholder: 'Username'
  },
  [EMAIL]: {
    placeholder: 'Address'
  }
}

class AddParticipantForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      submitting: false,
      account: { value: '' }
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.typeSelected && !prevProps.typeSelected) {
      this.focusField()
    }
  }

  render () {
    const { account, submitting } = this.state
    const { type: inputMode, style } = this.props

    return (
      <form
        ref={el => {
          this.formEl = el
        }}
        className={css(styles.form)}
        onSubmit={this.handleSubmit}
        style={style}
      >
        {inputMode === 'twitter' &&
          <Icon
            name='twitter'
            fill={colors.twitterblue}
            style={{ width: 34, height: 34, marginLeft: 4 }}
          />}
        {inputMode === 'sideway' &&
          <Icon
            name='sideway'
            style={{ width: 34, height: 34, marginLeft: 4 }}
            fill={colors.brandgreen}
          />}
        {inputMode === 'email' &&
          <Icon
            name='email'
            style={{ width: 24, height: 24, marginLeft: 4 }}
          />}
        <input
          ref={el => {
            this.inputEl = el
          }}
          className={css(styles.input)}
          autoFocus
          id='AddParticipant'
          name='addParticipant'
          value={account.value}
          onChange={this.handleAccountChange}
          type={inputMode === 'email' ? 'email' : 'text'}
          placeholder={typeMap[inputMode].placeholder}
        />
        <Button
          color='brandgreen'
          type='submit'
          label='Add Participant'
          tooltip
          isInline
          disabled={submitting}
          style={{
            width: 28,
            height: 28,
            minWidth: 28,
            padding: 0
          }}
        >
          <Icon
            name='add'
            fill={colors.brandgreen}
            style={{ width: 28, height: 28 }}
          />
        </Button>
      </form>
    )
  }

  handleAccountChange = e => {
    const { value } = e.target

    this.setState({ account: { ...this.state.account, value } })
  };

  handleSubmit = e => {
    const { account, submitting } = this.state
    const { dispatch, onDone, roomId, type } = this.props

    let action

    e.preventDefault()

    if (submitting || !account.value) {
      return
    }

    if (type === EMAIL) {
      action = roomActions.addParticipantById // `email` is used as an id.  So we send the request with { id: emailAddress }
    } else {
      action = roomActions.addParticipantByUsername // sideway username or twitter username
    }

    dispatch(action(roomId, account.value, type)).then(res => {
      if (!res.ok) {
        let message

        if (res.data.message.includes('already includes participants')) {
          message = `${account.value} is already in the conversation`
        } else if (
          res.data.message.includes(
            'exceed the maximum number of participants allowed'
          )
        ) {
          message = 'Room has reached maximum number of participants'
        } else {
          message = `We could not add ${account.value} to this conversation`
        }

        dispatch(sitrep.error(message))
        return this.setState({
          account: { ...account, error: true },
          submitting: false
        })
      }

      this.setState({ account: { value: '' }, submitting: false })
      this.inputEl.blur()
      onDone()
    })
  };

  focusField () {
    this.inputEl.focus()
  }
}

const styles = StyleSheet.create({
  form: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 2,
    background: colors.offwhite
  },
  input: {
    ...font.body2,
    flexShrink: 1,
    flexGrow: 1,
    paddingTop: 0,
    paddingRight: 4,
    paddingBottom: 0,
    paddingLeft: 4,
    background: colors.offwhite,
    border: 'none',
    outline: 'none',
    boxShadow: 'none'
  },
  addButton: {
    flex: 'none',
    width: 34,
    minWidth: 0,
    paddingLeft: 0,
    paddingRight: 0
  }
})

export default AddParticipantForm
