import { Component } from 'react'
import Link from 'react-router-dom/es/Link'
import { css, StyleSheet } from 'aphrodite/no-important'
import { breakpoints, colors, font } from 'style'

const LINK_MAP = [
  {
    name: 'Blog',
    link: 'https://blog.sideway.com'
  },
  {
    name: 'Terms',
    link: '/terms'
  },
  {
    name: 'Privacy',
    link: '/terms/privacy-policy'
  }
]

const NavLink = ({ name, link }) => {
  const isExternalLink = link.indexOf('/') !== 0

  if (isExternalLink) {
    return (
      <a
        className={css(styles.footerLink)}
        href={link}
        target='_blank'
        rel='noopener'
      >
        {name}
      </a>
    )
  }

  return (
    <Link className={css(styles.footerLink)} to={link}>
      {name}
    </Link>
  )
}

class Footer extends Component {
  render () {
    return (
      <footer className={css(styles.footer)}>
        <nav className={css(styles.nav)}>
          <ul className={css(styles.linkList)}>
            {LINK_MAP.map(({ name, link }) => {
              return (
                <li key={name} className={css(styles.linkItem)}>
                  <NavLink name={name} link={link} />
                </li>
              )
            })}
          </ul>
        </nav>
      </footer>
    )
  }
}

const styles = StyleSheet.create({
  footer: {
    // ...commonStyles.drawnBorder(true, false, false, false, colors.faintgray),
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.90)',
    borderTop: `1px solid ${colors.faintgray}`
  },
  nav: {
    flex: 1,
    maxWidth: breakpoints.tablet,
    padding: 4
  },
  linkList: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center'
  },
  linkItem: {
    paddingTop: 4,
    paddingRight: 16,
    paddingBottom: 4,
    paddingLeft: 16
  },
  footerLink: {
    ...font.caption,
    color: colors.brandgreen
  }
})

export default Footer
