import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'
import { profileActions } from 'redux/profile'

class AccountEmails extends Component {
  render () {
    const { profile } = this.props
    const sortedEmails = this.sortProfileEmails(profile)

    return (
      <section className={css(styles.accountEmails)}>
        {sortedEmails.map((email, i) => {
          const address = email.address
          const verified = email.verified
          const primary = email.primary

          return (
            <div
              key={i + '-' + address}
              className={css(
                styles.address,
                i === 0 && styles.noMargin,
                primary && styles.primaryAddress,
                primary && verified && styles.primaryVerified
              )}
            >
              <p>
                {address}
              </p>
              {this.renderLinks(address, verified, primary)}
            </div>
          )
        })}
      </section>
    );
  }

  renderLinks (address, verified, primary) {
    const { dispatch } = this.props

    if (typeof verified === 'string') {
      return (
        <span
          key={'verifying' + address}
          className={css(styles.addressAction, styles.verifying)}
        >
          Check your email to verify
        </span>
      )
    }

    return [
      // Email is not primary and can be deleted
      !primary &&
        <a
          key={'deleted' + address}
          href='#'
          onClick={this.createDeleteHandler(address, dispatch)}
          className={css(styles.addressAction, styles.deleteAction)}
        >
          Delete
        </a>,

      // Email is not verified
      !verified &&
        <a
          key={'verify' + address}
          href='#'
          onClick={this.createVerifyHandler(address, dispatch)}
          className={css(styles.addressAction, styles.verifyAction)}
        >
          Verify
        </a>,

      // Email is verified and not primary, can be made primary
      verified &&
        !primary &&
        <a
          key={'primary' + address}
          href='#'
          onClick={this.createPrimaryHandler(address, dispatch)}
          className={css(styles.addressAction, styles.primaryAction)}
        >
          Make Primary
        </a>
    ]
  }

  sortProfileEmails ({ emails, primary }) {
    return Object.keys(emails).reduce(
      (accum, address) => {
        const emailObj = emails[address]

        if (!emailObj) {
          return accum
        }

        const emailWithAddress = {
          address,
          public: emailObj.public,
          verified: emailObj.verified
        }

        if (address === primary) {
          emailWithAddress.primary = true
          return [emailWithAddress, ...accum]
        }

        emailWithAddress.primary = false
        return [...accum, emailWithAddress]
      },
      []
    )
  }

  createVerifyHandler (address) {
    const { dispatch } = this.props

    return e => {
      e.preventDefault()

      dispatch(profileActions.verifyEmail(address))
    }
  }

  createPrimaryHandler (address) {
    const { dispatch } = this.props

    return e => {
      e.preventDefault()
      dispatch(profileActions.setPrimaryEmail(address))
    }
  }

  createDeleteHandler (address) {
    const { dispatch } = this.props

    return e => {
      e.preventDefault()
      dispatch(profileActions.deleteEmail(address))
    }
  }
}

const styles = StyleSheet.create({
  accountEmails: {
    ...font.body2,
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: 16
  },
  address: {
    marginTop: 8
  },
  noMargin: {
    marginTop: 0
  },
  primaryAddress: {
    ...font.body1,
    fontWeight: 'bolder'
  },
  primaryVerified: {
    color: colors.midgreen
  },
  addressAction: {
    ...font.caption,
    marginRight: 8,
    cursor: 'pointer',
    ':hover': {
      textDecoration: 'underline'
    }
  },
  verifyAction: {
    color: colors.brandgreen
  },
  primaryAction: {
    color: colors.brandgreen
  },
  deleteAction: {
    color: colors.red
  },
  verifying: {
    color: colors.midgreen,
    ':hover': {
      textDecoration: 'none'
    }
  }
})

export default AccountEmails
