import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import AvatarEditor from 'react-avatar-editor'
import { colors, font } from 'style'
import ProfileSection from 'account/ProfileSection'
import FileDrop from 'ui/FileDrop'
import Button from 'ui/Button'
import Icon from 'art/Icon'
import { profileActions } from 'redux/profile'
import { toBlob } from 'utils/canvas'

const PhotoDisplay = ({ entered, openDropZoneManually, profile }) => {
  return (
    <div className={css(styles.displayWrapper)}>
      <img className={css(styles.displayImage)} src={profile.avatar} />
      <div
        className={css(
          styles.editOverlay,
          (entered || !profile.avatar) && styles.editOverlayEntered
        )}
        onClick={openDropZoneManually}
      >
        <Icon
          name='photo-camera'
          fill={colors.white}
          className={css(entered && styles.dropEntered)}
          style={{
            height: 36,
            width: 36
          }}
        />
        <div className={css(styles.overlayMessage)}>
          {entered ? 'Drop Here' : profile.avatar ? 'Update' : 'Upload'}
        </div>
      </div>
    </div>
  )
}

class PhotoEditor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      errorMessage: '',
      scale: 1
    }
  }

  render () {
    const { errorMessage, scale } = this.state
    const { acceptedFile } = this.props

    return (
      <div className={css(styles.editorWrapper)}>
        <div className={css(styles.avatarRow)}>
          <AvatarEditor
            ref={node => {
              this.editor = node
            }}
            style={{
              width: 96,
              height: 96
            }}
            image={acceptedFile.preview}
            width={192}
            height={192}
            border={0}
            color={[255, 255, 255, 0.6]}
            scale={parseFloat(scale)}
            onDropFile={this.handleFileDrop}
          />
          <input
            className={css(styles.scaleSlider)}
            name='scale'
            type='range'
            min='1'
            max='2'
            step='0.01'
            onChange={this.handleScaleChange}
          />
        </div>
        <div className={css(styles.actionWrapper)}>
          {errorMessage &&
            <div className={css(styles.errorMessage)}>
              {errorMessage}
            </div>}
          <div className={css(styles.buttonWrapper)}>
            <Button
              style={{
                flex: '0 1 48%',
                height: 36
              }}
              color='red'
              label='Cancel'
              onClick={this.handleCancelClick}
              tooltip
            >
              Cancel
            </Button>
            <Button
              style={{
                flex: '0 1 48%',
                height: 36
              }}
              color='brandgreen'
              label='Save Photo'
              tooltip
              onClick={this.handleSaveClick}
            >
              Save Photo
            </Button>
          </div>
        </div>
      </div>
    )
  }

  handleFileDrop = e => {
    const file = e.dataTransfer.files[0]
    if (!file) {
      return
    }
    this.setState({ fileType: file.type, errorMessage: '' })
  };

  handleScaleChange = e => {
    this.setState({ scale: e.target.value })
  };

  handleCancelClick = () => {
    const { resetDropZone } = this.props
    resetDropZone()
  };

  handleSaveClick = async () => {
    const { fileType } = this.state
    const {
      dispatch,
      resetDropZone
    } = this.props

    const image = this.editor.getImageScaledToCanvas()
    const blob = await toBlob(image, fileType, 1)
    const { ok, status } = await dispatch(profileActions.updateAvatar(blob))

    if (ok) {
      return resetDropZone()
    }

    this.setState({
      errorMessage: status === 413
        ? 'Maximum allowed upload size is 5Mb'
        : 'We could not update your avatar at this time'
    })
  };
}

export default class EditAvatar extends Component {
  render () {
    const { dispatch, profile } = this.props

    return (
      <ProfileSection title='Profile Photo' showTopBorder>
        <FileDrop fullscreenBackdrop={false}>
          {({ acceptedFile, entered, openDropZoneManually, resetDropZone }) => {
            return (
              <div>
                {!acceptedFile &&
                  <PhotoDisplay
                    entered={entered}
                    openDropZoneManually={openDropZoneManually}
                    profile={profile}
                  />}
                {acceptedFile &&
                  <PhotoEditor
                    acceptedFile={acceptedFile}
                    dispatch={dispatch}
                    resetDropZone={resetDropZone}
                  />}
              </div>
            )
          }}
        </FileDrop>
      </ProfileSection>
    )
  }
}

const styles = StyleSheet.create({
  displayWrapper: {
    position: 'relative',
    width: 96
  },
  editOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'opacity 200ms ease-out',
    ':hover': {
      opacity: 1
    }
  },
  editOverlayEntered: {
    opacity: 1
  },
  displayImage: {
    display: 'block',
    width: 96,
    height: 96,
    borderRadius: 2
  },
  dropEntered: {
    transform: 'scale(1.2)'
  },
  overlayMessage: {
    ...font.caption,
    textAlign: 'center',
    color: colors.white
  },
  editorWrapper: {
    display: 'flex',
    flexDirection: 'column'
  },
  scaleSlider: {
    width: 96,
    marginBottom: 8
  },
  avatarRow: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  actionWrapper: {
    paddingTop: 8
  },
  errorMessage: {
    ...font.body2,
    color: colors.red
  },
  buttonWrapper: {
    display: 'flex',
    justifyContent: 'space-between'
  }
})
