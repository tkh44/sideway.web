import { DOM } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'
import Icon from 'art/Icon'

const TwitterUsername = ({ user: { networks }, className }) => {
  const twitterUsername = networks && networks.twitter

  if (!twitterUsername) {
    return DOM.noscript()
  }

  return (
    <a
      className={css(styles.twitterUsername)}
      href={`https://twitter.com/${twitterUsername}`}
      target='_blank'
      rel='noopener'
    >
      <Icon
        name='twitter'
        className={css(styles.icon)}
        style={{
          width: 18,
          height: 18
        }}
        fill={colors.twitterblue}
      />
      {`@${twitterUsername}`}
    </a>
  )
}

const styles = StyleSheet.create({
  twitterUsername: {
    ...font.caption,
    display: 'flex',
    alignItems: 'center',
    height: 24,
    padding: 0,

    ':hover': {
      color: colors.twitterblue
    }
  },
  icon: {
    marginRight: 4
  }
})

export default TwitterUsername
