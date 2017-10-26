import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors } from 'style'
import ProfileSection from 'account/ProfileSection'
import ProviderButton from 'ui/ProviderButton'
import Icon from 'art/Icon'
import Button from 'ui/Button'
import TwitterAutoPostToggle from 'account/TwitterAutoPostToggle'
import { profileActions } from 'redux/profile'

class Twitter extends Component {
  render () {
    const { profile } = this.props
    const { networks: { twitter = {} } } = profile

    return (
      <ProfileSection title='Connect to Twitter' showTopBorder>
        {twitter.id
          ? this.renderHasLinkedAccount()
          : this.renderNoLinkedAccount()}
      </ProfileSection>
    )
  }

  renderHasLinkedAccount () {
    const { profile, dispatch } = this.props
    const { preferences, networks: { twitter = {} }, scope = [] } = profile
    const hasTwitterScope = scope.indexOf('room:twitter') > -1

    return (
      <div>
        <div className={css(styles.twitterUsername)}>
          <Icon
            name='twitter'
            fill={colors.twitterblue}
            style={{ width: 32, height: 32 }}
          />
          <a
            className={css(styles.usernameLink, styles.padLeft)}
            href={'https://twitter.com/' + twitter.username}
            target='_blank'
            rel='noopener'
          >
            {`@${twitter.username}`}
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
        {hasTwitterScope &&
          <TwitterAutoPostToggle
            twitter={twitter}
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
          provider='twitter'
          nextState={`${window.location.pathname}:link:twitter`}
        />
      </div>
    )
  }

  handleTwitterUnlink = () => {
    const { dispatch } = this.props

    dispatch(profileActions.unlinkProvider('twitter'))
  };
}

const styles = StyleSheet.create({
  twitterUsername: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: 8
  },
  usernameLink: {
    flex: 1,
    paddingLeft: 8,
    ':hover': {
      color: colors.twitterblue
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

export default Twitter
