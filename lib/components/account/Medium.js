import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors } from 'style'
import ProfileSection from 'account/ProfileSection'
import ProviderButton from 'ui/ProviderButton'
import Icon from 'art/Icon'
import Button from 'ui/Button'
import TwitterAutoPostToggle from 'account/TwitterAutoPostToggle'
import { profileActions } from 'redux/profile'

export default class Medium extends Component {
  render () {
    const { profile } = this.props
    const { networks: { medium = {} } } = profile

    return (
      <ProfileSection title='Connect to Medium' showTopBorder>
        {medium.id
          ? this.renderHasLinkedAccount()
          : this.renderNoLinkedAccount()}
      </ProfileSection>
    )
  }

  renderHasLinkedAccount () {
    const { profile, dispatch } = this.props
    const { preferences, networks: { medium = {} }, scope = [] } = profile
    const hasMediumScope = scope.indexOf('room:medium') > -1

    return (
      <div>
        <div className={css(styles.mediumUsername)}>
          <Icon
            name='medium'
            fill={colors.mediumgreen}
            style={{ width: 32, height: 32 }}
          />
          <a
            className={css(styles.usernameLink, styles.padLeft)}
            href={'https://medium.com/' + medium.username}
            target='_blank'
            rel='noopener'
          >
            {`${medium.username}`}
          </a>
          <Button
            className={css(styles.accountAction)}
            color='red'
            textOnly
            onClick={this.handleTwitterUnlink}
          >
            Unlink
          </Button>
        </div>
        {hasMediumScope &&
          <TwitterAutoPostToggle
            medium={medium}
            preferences={preferences}
            dispatch={dispatch}
          />}
      </div>
    )
  }

  renderNoLinkedAccount () {
    return (
      <div className={css(styles.buttonWrapper)}>
        <ProviderButton
          provider='medium'
          nextState={`${window.location.pathname}:link:medium`}
        />
      </div>
    )
  }

  handleTwitterUnlink = () => {
    const { dispatch } = this.props

    dispatch(profileActions.unlinkProvider('medium'))
  };
}

const styles = StyleSheet.create({
  mediumUsername: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: 8
  },
  usernameLink: {
    flex: 1,
    paddingLeft: 16,
    ':hover': {
      color: colors.mediumgreen
    }
  },
  accountAction: {
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 16
  },
  buttonWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    width: '100%'
  }
})
