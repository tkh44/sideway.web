import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'
import Link from 'react-router-dom/es/Link'
import Icon from 'art/Icon'

export default ({ user: { username } }) => {
  if (!username) {
    return null
  }

  return (
    <Link className={css(styles.username)} to={`/user/${username}`}>
      <Icon
        name='sideway'
        className={css(styles.icon)}
        style={{
          width: 18,
          height: 18
        }}
        fill={colors.brandgreen}
      />
      {username}
    </Link>
  )
}

const styles = StyleSheet.create({
  username: {
    ...font.caption,
    display: 'flex',
    alignItems: 'center',
    height: 24,
    ':hover': {
      color: colors.brandgreen
    }
  },
  icon: {
    marginRight: 2
  }
})
