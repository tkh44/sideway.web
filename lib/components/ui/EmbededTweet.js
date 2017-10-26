import { get } from 'lodash'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font, mediaQueries } from 'style'
import RedirectLink from 'ui/RedirectLink'
import { parseLinksFromText } from 'utils/parse-links'

const parseTweetContent = (content, links = []) => {
  const parts = parseLinksFromText(
    { text: content, links },
    { hashtag: true, mention: true }
  )

  return parts.map((parsed, i) => {
    const { type, text } = parsed

    if (type === 'text') {
      return text
    }

    if (type === 'hashtag') {
      return (
        <RedirectLink
          key={`parsed-tweet-part-${i}`}
          className={css(styles.twitterContentLink, styles.twitterHashtag)}
          initialUrl={`https://twitter.com/hashtag/${text}?src=hash`}
        >
          <b className={css(styles.symbol)}>
            #
          </b>
          <span>
            {text.replace('#', '')}
          </span>
        </RedirectLink>
      )
    }

    if (type === 'mention') {
      return (
        <RedirectLink
          key={`parsed-tweet-part-${i}`}
          className={css(styles.twitterContentLink, styles.twitterHandle)}
          initialUrl={`https://twitter.com/${text}`}
        >
          <b className={css(styles.symbol)}>
            @
          </b>
          <span>
            {text.replace('@', '')}
          </span>
        </RedirectLink>
      )
    }

    if (type === 'url') {
      return (
        <RedirectLink
          key={`parsed-tweet-part-${i}`}
          className={css(styles.twitterContentLink, styles.underlineOnHover)}
          initialUrl={text}
        >
          {text}
        </RedirectLink>
      )
    }
  })
}

export default function EmbededTweet ({ hideBorder, tweet = {}, summary = {} }) {
  const profileUrl = `https://twitter.com/${tweet.username}`

  return (
    <div
      className={css(styles.wrapper, hideBorder && styles.noBorder)}
      onClick={e => {
        if (e.target.tagName === 'A') {
          return
        }

        window.open(summary.url, '_blank')
      }}
    >
      <div className={css(styles.header)}>
        {tweet.avatar &&
          <RedirectLink className={css(styles.avatar)} initialUrl={profileUrl}>
            <img
              className={css(styles.avatarImg)}
              src={tweet.avatar}
              alt={tweet.username}
            />
          </RedirectLink>}
        <div className={css(styles.userMeta)}>
          {tweet.name &&
            <RedirectLink className={css(styles.name)} initialUrl={profileUrl}>
              {tweet.name}
            </RedirectLink>}
          {tweet.username &&
            <RedirectLink
              className={css(styles.username, styles.twitterHandle)}
              initialUrl={profileUrl}
            >
              <b className={css(styles.symbol)}>
                @
              </b>
              <span>
                {tweet.username}
              </span>
            </RedirectLink>}
        </div>
        <div className={css(styles.headerTweetMeta)}>
          <RedirectLink
            className={css(styles.twitterIcon)}
            initialUrl='https://twitter.com'
          >
            <img className={css(styles.twitterIconImg)} src={summary.icon} />
          </RedirectLink>
          {tweet.date &&
            <RedirectLink
              className={css(styles.date, styles.underlineOnHover)}
              initialUrl={summary.url}
            >
              {tweet.date}
            </RedirectLink>}
        </div>
      </div>
      {tweet.content &&
        <div className={css(styles.content)}>
          {tweet.content &&
            parseTweetContent(
              get(tweet, 'content', ''),
              Object.keys(get(tweet, 'links', {}))
            )}
        </div>}
      <div className={css(styles.footer)}>
        <RedirectLink
          className={css(styles.twitterIcon)}
          initialUrl='https://twitter.com'
        >
          <img
            className={css(styles.twitterIconImg)}
            src={summary.icon}
            alt='twitter'
          />
        </RedirectLink>
        {tweet.date &&
          <RedirectLink
            className={css(styles.date, styles.underlineOnHover)}
            initialUrl={summary.url}
          >
            {tweet.date}
          </RedirectLink>}
      </div>
    </div>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    minWidth: 320,
    maxWidth: 640,
    padding: 8,
    border: `1px solid ${colors.faintgray}`,
    borderRadius: 2,
    backgroundColor: colors.white,
    cursor: 'pointer'
  },
  noBorder: {
    border: 'none'
  },
  header: {
    ...font.caption,
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    [mediaQueries.phone]: {
      ...font.body2
    }
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 2
  },
  avatarImg: {
    width: 24,
    height: 24,
    borderRadius: 2
  },
  userMeta: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  name: {
    marginLeft: 8,
    fontWeight: 'bold',
    ':hover': {
      color: colors.brandgreen
    }
  },
  username: {
    marginLeft: 8,
    color: colors.lightgray
  },
  content: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
    cursor: 'text'
  },
  headerTweetMeta: {
    display: 'none',
    alignItems: 'center',
    marginLeft: 'auto',
    [mediaQueries.tablet]: {
      display: 'flex'
    }
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    [mediaQueries.tablet]: {
      display: 'none'
    }
  },
  twitterIcon: {
    width: 20,
    height: 20
  },
  twitterIconImg: {
    width: 20,
    height: 20
  },
  date: {
    ...font.caption,
    marginLeft: 8,
    color: colors.lightgray
  },
  twitterContentLink: {
    color: colors.brandgreen
  },
  underlineOnHover: {
    ':hover': {
      textDecoration: 'underline'
    }
  },
  twitterHashtag: {
    ':hover > span': {
      textDecoration: 'underline'
    }
  },
  twitterHandle: {
    ':hover > span': {
      textDecoration: 'underline'
    }
  },
  symbol: {
    fontWeight: 'normal'
  }
})
