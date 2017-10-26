import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, commonStyles, font } from 'style'
import Avatar from 'ui/Avatar'
import DisplayName from 'ui/DisplayName'
import SidewayUsername from 'ui/SidewayUsername'
import TwitterUsername from 'ui/TwitterUsername'

export default (
  {
    displayStyle,
    showTwitter = true,
    showUsername = true,
    size = 'xlarge',
    user = {}
  }
) => {
  if (!user.display) {
    // don't render empty boxes while loading
    return null
  }

  return (
    <div className={css(styles.aboutSubheader)}>
      <Avatar size={size} user={user} decorate={false} />
      <div className={css(styles.infoContainer)}>
        <DisplayName
          className={css(styles.displayName, styles[size])}
          style={displayStyle}
          user={user}
        />
        <div className={css(styles.usernameList)}>
          {showTwitter && <TwitterUsername user={user} />}
          {showUsername && <SidewayUsername user={user} />}
        </div>
      </div>
    </div>
  )
}

const styles = StyleSheet.create({
  aboutSubheader: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: 8
  },
  infoContainer: {
    paddingLeft: 12
  },
  displayName: {
    ...commonStyles.overflowEllipsis,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    fontWeight: 'bold',
    ':hover': {
      color: colors.brandgreen
    }
  },
  usernameList: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    marginLeft: -4
  },
  small: {
    ...font.caption,
    paddingBottom: 0
  },
  medium: {
    ...font.body2,
    paddingBottom: 0
  },
  large: {
    ...font.title
  },
  xlarge: {
    ...font.headline
  }
})
