import cn from 'classnames'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, commonStyles } from 'style'
import toClass from 'recompose/toClass'
import Link from 'react-router-dom/es/Link'
import NavLinks from 'ui/NavLinks'
import Icon from 'art/Icon'
import Sitrep from 'sitrep/Sitrep'

const Header = ({ className, style }) => {
  return (
    <header className={cn(css(styles.header), className)} style={style}>
      <div className={css(styles.inner)}>
        <Link to='/'>
          <Icon
            name='sideway'
            fill={colors.brandgreen}
            style={{
              marginLeft: -8,
              height: 52,
              width: 52
            }}
          />
        </Link>
        <NavLinks />
      </div>
      <Sitrep />
    </header>
  )
}

const styles = StyleSheet.create({
  header: {
    ...commonStyles.drawnBorder(false, false, true, false, colors.faintgray),
    flex: 'none',
    position: 'fixed',
    top: -1,
    left: 0,
    height: 64,
    width: '100%',
    paddingTop: 0,
    paddingRight: 16,
    paddingBottom: 0,
    paddingLeft: 16,
    zIndex: 11,
    backgroundColor: colors.white
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    height: 64,
    width: '100%',
    maxWidth: 1028,
    margin: '0 auto'
  }
})

export default toClass(Header)
