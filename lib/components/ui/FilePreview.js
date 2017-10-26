import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, commonStyles } from 'style'
import Icon from 'art/Icon'

export default function FilePreview (
  { file, imgMaxHeight, onCloseClick, style }
) {
  return (
    <div
      className={css(styles.filePreview)}
      style={{
        ...style
      }}
    >
      <div className={css(styles.imageContainer)}>
        <img
          className={css(styles.previewImage)}
          style={{
            maxHeight: imgMaxHeight,
            maxWidth: '100%'
          }}
          src={file.preview}
        />
      </div>
      <Icon
        name='close'
        className={css(styles.closeIcon)}
        style={{
          width: 32,
          height: 32
        }}
        onClick={onCloseClick}
      />
    </div>
  )
}

const styles = StyleSheet.create({
  filePreview: {
    ...commonStyles.drawnBorder(true, true, false, true, colors.lightgray),
    ...commonStyles.opaqueBg(),
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 8,
    paddingRight: 36,
    paddingBottom: 8,
    paddingLeft: 36
  },
  closeIcon: {
    position: 'absolute',
    top: 2,
    right: 4,
    fill: colors.darkgray,
    cursor: 'pointer',
    ':hover': {
      fill: colors.brandgreen
    }
  },
  imageContainer: {
    flex: '1 1 auto',
    textAlign: 'center'
  },
  previewImage: {
    flex: 1
  }
})
