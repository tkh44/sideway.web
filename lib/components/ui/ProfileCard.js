import { Component } from 'react'
import shallowCompare from 'shallow-compare'
import { css, StyleSheet } from 'aphrodite/no-important'
import { commonStyles, font } from 'style'
import Avatar from 'ui/Avatar'
import DisplayName from 'ui/DisplayName'
import SidewayUsername from 'ui/SidewayUsername'
import TwitterUsername from 'ui/TwitterUsername'

class ProfileCard extends Component {
  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { user, decorateAvatar = false } = this.props

    return (
      <div className={css(styles.profileCard)}>
        <Avatar
          size='large'
          className={css(styles.profileCardAvatar)}
          user={user}
          decorate={decorateAvatar}
        />
        <div className={css(styles.infoContainer)}>
          <DisplayName className={css(styles.displayName)} user={user} />
          <div className={css(styles.usernameList)}>
            <SidewayUsername user={user} />
            <TwitterUsername user={user} />
          </div>
        </div>
      </div>
    )
  }
}

const styles = StyleSheet.create({
  profileCard: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: 8
  },
  profileCardAvatar: {
    alignSelf: 'flex-start',
    marginTop: 2
  },
  infoContainer: {
    paddingLeft: 12,
    paddingRight: 8
  },
  displayName: {
    ...font.body1,
    ...commonStyles.overflowEllipsis,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 4,
    paddingLeft: 0
  },
  usernameList: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    marginLeft: -4
  }
})

export default ProfileCard
