import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font, mediaQueries } from 'style'

export default function Stat ({ value, label }) {
  return (
    <div className={css(styles.stat)}>
      <div className={css(styles.statValue)}>
        {value}
      </div>
      <div className={css(styles.statLabel)}>
        {label}
      </div>
    </div>
  )
}

const styles = StyleSheet.create({
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 1 25%',
    paddingTop: 4,
    paddingRight: 4,
    paddingBottom: 4,
    paddingLeft: 4
  },
  statValue: {
    ...font.body2,
    color: colors.darkgray,
    // marginBottom: 4,
    letterSpace: '-.125em',
    lineHeight: 1,
    [mediaQueries.tablet]: {
      ...font.headline
    }
  },
  statLabel: {
    ...font.tiny,
    color: colors.midgray,
    [mediaQueries.tablet]: {
      ...font.caption
    }
  }
})
