import withHandlers from 'recompose/withHandlers'
import Icon from 'art/Icon'
import Button from 'ui/Button'
import { queryString } from 'utils/string'

export default withHandlers({
  handleClick: ({ onClick, shareUrl = '' }) =>
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

      window.open(
        `https://www.facebook.com/sharer/sharer.php?${queryString({
          u: shareUrl
        })}`,
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
      style={style}
      color='facebookblue'
      iconOnly
      onClick={handleClick}
      label='Share via Facebook'
      tooltip='Share via Facebook'
    >
      <Icon
        name='facebook'
        fill='currentColor'
        style={{
          height: 36,
          width: 36
        }}
      />
    </Button>
  )
})
