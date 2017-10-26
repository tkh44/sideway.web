import { Component } from 'react'
import compose from 'recompose/compose'
import defaultProps from 'recompose/defaultProps'
import withHandlers from 'recompose/withHandlers'
import withReducer from 'recompose/withReducer'
import DropZone from 'react-dropzone'
import { spring, TransitionMotion } from 'react-motion'
import { css, StyleSheet } from 'aphrodite/no-important'
import { animation, colors, commonStyles, font } from 'style'
import Icon from 'art/Icon'

const initialState = { entered: false, acceptedFile: null, rejectedFile: null }
const PANEL_SPRING = { stiffness: 300, damping: 28 }

export default compose(
  defaultProps({
    activeClassName: 'active-file-drop',
    activeStyle: {},
    className: 'file-drop', // this lib will style the drop zone if no class is provided
    enabled: true,
    fullscreenBackdrop: true,
    uploadMessage: 'drop image here'
  }),
  withReducer(
    'dropState',
    'updateState',
    (state, action) => {
      switch (action.type) {
        case 'DRAG_ENTER':
          return { ...state, ...{ entered: true } }
        case 'DRAG_LEAVE':
          return { ...state, ...{ entered: false } }
        case 'ACCEPT_FILE':
          return {
            entered: false,
            acceptedFile: action.payload,
            rejectedFile: null
          }
        case 'REJECT_FILE':
          return {
            entered: false,
            acceptedFile: null,
            rejectedFile: action.payload
          }
        case 'RESET':
          return initialState
        default:
          return state
      }
    },
    initialState
  ),
  withHandlers({
    handleDropAccepted: ({ enabled, onDropAccepted, updateState, state }) =>
      files => {
        const file = files[0]
        updateState({ type: 'ACCEPT_FILE', payload: file })
        if (onDropAccepted) {
          onDropAccepted(file)
        }
      },
    handleDropRejected: ({ onDropRejected, updateState, state }) =>
      files => {
        const file = files[0]
        updateState({ type: 'REJECT_FILE', payload: file })
        if (onDropRejected) {
          onDropRejected(file)
        }
      },
    handleDragEnter: ({ updateState }) =>
      () => updateState({ type: 'DRAG_ENTER' }),
    handleDragLeave: ({ updateState }) =>
      () => updateState({ type: 'DRAG_LEAVE' }),
    handleReset: ({ updateState }) =>
      () => {
        updateState({ type: 'RESET' })
      }
  })
)(
  class FileDrop extends Component {
    render () {
      const {
        activeClassName,
        activeStyle,
        children,
        className,
        dropState,
        enabled,
        fullscreenBackdrop,
        handleDragEnter,
        handleDragLeave,
        handleDropAccepted,
        handleDropRejected,
        handleReset,
        style,
        uploadMessage
      } = this.props

      if (!enabled) {
        return (
          <div className={className} style={style}>
            {children({
              ...dropState,
              openDropZoneManually: this.openDropZoneManually,
              resetDropZone: handleReset
            })}
          </div>
        )
      }

      return (
        <DropZone
          ref={node => {
            this.dropZone = node
          }}
          className={className}
          style={{
            position: 'relative',
            ...style
          }}
          activeClassName={activeClassName}
          activeStyle={activeStyle}
          multiple={false}
          accept='image/*'
          disableClick
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDropAccepted={handleDropAccepted}
          onDropRejected={handleDropRejected}
        >
          {fullscreenBackdrop &&
            <TransitionMotion
              willEnter={this.willEnter}
              willLeave={this.willLeave}
              styles={this.getStyles()}
            >
              {currentStyles => (
                <div>
                  {currentStyles.map(config => {
                    return (
                      <div
                        key={config.key}
                        className={css(styles.dropBackdrop)}
                        style={{
                          opacity: dropState.entered ? 1 : 0
                        }}
                      >
                        <div
                          className={css(styles.dropHere)}
                          style={{
                            transform: `scale3d(${config.style.scale}, ${config.style.scale}, ${config.style.scale})`,
                            opacity: config.style.opacity
                          }}
                        >
                          <Icon
                            name='image'
                            className={css(styles.dropHereIcon)}
                            style={{
                              width: 28,
                              height: 28
                            }}
                            fill={colors.brandgreen}
                          />
                          <div className={css(styles.dropText)}>
                            {uploadMessage}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TransitionMotion>}
          {children({
            ...dropState,
            openDropZoneManually: this.openDropZoneManually,
            resetDropZone: handleReset
          })}
        </DropZone>
      )
    }

    getStyles = () => {
      const { dropState } = this.props

      if (!dropState.entered) {
        return []
      }

      return [
        {
          key: 'drop-panel',
          data: {},
          style: {
            scale: spring(1, PANEL_SPRING),
            opacity: spring(1, PANEL_SPRING)
          }
        }
      ]
    };

    willEnter = () => ({ scale: 0.8, opacity: 0 });

    willLeave = () => ({ scale: 0.8, opacity: 0 });

    openDropZoneManually = () => {
      this.dropZone.open()
    };
  }
)

const styles = StyleSheet.create({
  dropBackdrop: {
    ...commonStyles.opaqueBg('rgba(255, 255, 255, 0.8)'),
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15
  },
  dropHere: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    border: `4px dashed ${colors.lightgray}`,
    borderRadius: 2,
    zIndex: 501
  },
  dropHereIcon: {
    animationName: animation.keyframes.pulse,
    animationDuration: '2s',
    animationIterationCount: 'infinite'
  },
  dropText: {
    ...font.body2,
    color: colors.lightgray,
    textAlign: 'center'
  }
})
