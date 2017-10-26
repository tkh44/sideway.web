import Link from 'react-router-dom/es/Link'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'

export default function PageListItem ({ page }) {
  const roomCount = page.rooms
  return (
    <div className={css(styles.pageListItem)}>
      <div className={css(styles.titleRow)}>
        <Link className={css(styles.title)} to={`/page/${page.id}`}>
          {page.title}
        </Link>
      </div>
      {page.description &&
        <div className={css(styles.description)}>
          {page.description}
        </div>}
      <div className={css(styles.roomCount)}>
        {`${roomCount} room${roomCount === 1 ? '' : 's'}`}
      </div>
    </div>
  )
}

const styles = StyleSheet.create({
  pageListItem: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    paddingTop: 16,
    paddingRight: 0,
    paddingBottom: 16,
    paddingLeft: 0,
    background: colors.white
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center'
  },
  title: {
    ...font.headline,
    fontWeight: 'bold',
    color: colors.darkgray,
    ':hover': {
      color: colors.brandgreen,
      cursor: 'pointer'
    }
  },
  description: {
    ...font.body2,
    paddingTop: 4,
    color: colors.midgray
  },
  roomCount: {
    ...font.body2,
    paddingTop: 4,
    paddingBottom: 4,
    color: colors.lightgray
  }
})
