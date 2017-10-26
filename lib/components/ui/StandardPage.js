import { css, StyleSheet } from 'aphrodite/no-important'
import { breakpoints, mediaQueries } from 'style'

export default (
  {
    children,
    contentMarginTop = 80,
    contentMarginBottom = 16,
    header,
    headerProps = {},
    horizontalPadding = true,
    footer,
    footerProps = {},
    maxWidth = breakpoints.tablet,
    sectionStyle,
    style
  }
) => {
  return (
    <div
      className={css(styles.page)}
      style={{
        paddingTop: contentMarginTop,
        ...style
      }}
    >
      {header && React.createElement(header, headerProps)}
      <section
        className={css(
          styles.content,
          horizontalPadding && styles.horizontalPadding
        )}
        style={{ maxWidth, marginBottom: contentMarginBottom, ...sectionStyle }}
      >
        {children}
      </section>
      {footer && React.createElement(footer, footerProps)}
    </div>
  )
}

const styles = StyleSheet.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1'
  },
  content: {
    flex: '1',
    width: '100%',
    marginRight: 'auto',
    // marginBottom: 16,
    marginLeft: 'auto'
  },
  horizontalPadding: {
    width: 'calc(100% - 1rem)',
    [mediaQueries.phone]: {
      width: 'calc(100% - 2rem)'
    }
  }
})
