import withHandlers from 'recompose/withHandlers'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors } from 'style'
import Icon from 'art/Icon'
import Button from 'ui/Button'
import { queryString } from 'utils/string'

export default withHandlers({
  handleClick: (
    { onClick, twitterHandle = '', tweetText = '', tweetUrl = '' }
  ) =>
    e => {
      const windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes'
      const width = 550
      const height = 420
      const winHeight = window.screen.height
      const winWidth = window.screen.width
      const left = Math.round(winWidth / 2 - width / 2)
      let top = 0

      if (winHeight > height) {
        top = Math.round(winHeight / 2 - height / 2)
      }

      const queryParams = { text: tweetText, url: tweetUrl }
      if (twitterHandle && twitterHandle.length) {
        queryParams.via = twitterHandle
      }

      window.open(
        `https://twitter.com/intent/tweet?${queryString(queryParams)}`,
        'intent',
        `${windowOptions},width=${width},height=${height},left=${left},top=${top}`
      )

      if (onClick) {
        onClick(e)
      }
    }
})(({
  handleClick,
  style
}) => {
  return (
    <Button
      className={css(styles.button)}
      style={style}
      color='twitterblue'
      iconOnly
      onClick={handleClick}
      label='Share via Twitter'
      tooltip
    >
      <Icon
        name='twitter'
        className={css(styles.icon)}
        fill='currentColor'
        style={{
          height: 36,
          width: 36
        }}
      />
    </Button>
  )
})

const styles = StyleSheet.create({
  button: {
    color: colors.lightgray,
    ':hover': {
      color: colors.twitterblue
    },
    ':focus': {
      color: colors.twitterblue
    }
  }
})
