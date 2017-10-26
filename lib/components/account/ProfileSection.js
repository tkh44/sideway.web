import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, commonStyles, font } from 'style'

export default class ProfileSection extends Component {
  render () {
    const {
      title,
      children,
      showTopBorder
    } = this.props

    return (
      <section
        className={css(
          styles.profileSection,
          showTopBorder && styles.showTopBorder
        )}
      >
        {title &&
          <legend className={css(styles.title)}>
            {title}
          </legend>}
        {children}
      </section>
    )
  }
}

const styles = StyleSheet.create({
  profileSection: {
    position: 'relative',
    paddingTop: 16,
    paddingRight: 0,
    paddingBottom: 24,
    paddingLeft: 0
  },
  showTopBorder: {
    ...commonStyles.drawnBorder(true, false, false, false, colors.faintgray)
  },
  title: {
    ...font.title,
    paddingBottom: 12
  }
})
