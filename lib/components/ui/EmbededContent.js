import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, commonStyles, font, mediaQueries } from 'style'
import RedirectLink from 'ui/RedirectLink'
import EmbedImage from 'ui/EmbedImage'

export default function EmbededContent (
  { hideBorder, summary = {}, imageOnly }
) {
  if (imageOnly) {
    return <EmbedImage summary={summary} />
  }

  return (
    <div
      className={css(
        styles.wrapper,
        imageOnly && styles.wrapperImageOnly,
        hideBorder && styles.noBorder
      )}
    >
      {!imageOnly &&
        <div className={css(styles.content)}>
          <div className={css(styles.header)}>
            {summary.icon &&
              <img className={css(styles.icon)} src={summary.icon} />}
            {summary.site &&
              <div
                className={css(styles.site, !summary.icon && styles.siteNoIcon)}
              >
                {summary.site}
              </div>}
            {summary.title &&
              <RedirectLink
                className={css(styles.title)}
                initialUrl={summary.url}
              >
                {summary.title}
              </RedirectLink>}
          </div>
          {summary.description &&
            <div className={css(styles.description)}>
              {summary.description}
            </div>}
        </div>}
      {summary.image &&
        <RedirectLink
          className={css(styles.image, imageOnly && styles.imageOnlyImage)}
          style={{
            backgroundImage: `url(${summary.image})`
          }}
          initialUrl={summary.url}
        />}
    </div>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    ...font.body1,
    display: 'flex',
    width: '100%',
    minWidth: 280,
    maxWidth: 640,
    padding: 8,
    border: `1px solid ${colors.faintgray}`,
    borderRadius: 2,
    backgroundColor: colors.white,
    fontWeight: 400
  },
  wrapperImageOnly: {
    minHeight: 128,
    maxHeight: 256,
    padding: 0,
    border: 'none'
  },
  noBorder: {
    border: 'none'
  },
  content: {
    flex: '1 1 0%',
    minWidth: 0,
    marginRight: 8
  },
  image: {
    flex: '1 0 20%',
    maxWidth: 48,
    maxHeight: 48,
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    borderRadius: 2,
    [mediaQueries.phone]: {
      maxWidth: 72,
      maxHeight: 'none'
    }
  },
  imageOnlyImage: {
    maxWidth: 'none',
    backgroundSize: 'contain',
    backgroundPosition: 'top left'
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  icon: {
    width: 20,
    height: 20
  },
  site: {
    marginLeft: 8,
    color: colors.lightgray,
    fontWeight: 300
  },
  siteNoIcon: {
    marginLeft: 0
  },
  title: {
    ...font.body2,
    ...commonStyles.overflowEllipsis,
    marginTop: 4,
    color: colors.midgreen,
    width: '100%'
  },
  description: {
    ...commonStyles.overflowEllipsis,
    marginTop: 4,
    fontSize: 14
  }
})
