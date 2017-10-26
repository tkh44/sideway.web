import { cloneElement, Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { breakpoints, colors, commonStyles, mediaQueries } from 'style'
import Icon from 'art/Icon'
import Modal from 'react-modal'

const mountedInstances = new Map()

function registerModal (instance, open) {
  mountedInstances.set(instance, open)
  if (open) {
    document.body.classList.add('SidewayModal--open')
  }
}

function updateModal (instance, open) {
  mountedInstances.set(instance, open)

  let shouldRemoveClass = !open
  for (let [, isOpen] of mountedInstances) {
    if (isOpen) {
      shouldRemoveClass = false
      break
    }
  }
  if (shouldRemoveClass) {
    document.body.classList.remove('SidewayModal--open')
  } else {
    document.body.classList.add('SidewayModal--open')
  }
}

function unregisterModal (instance) {
  mountedInstances.delete(instance)
  let shouldRemoveClass = true
  for (let [, isOpen] of mountedInstances) {
    if (isOpen) {
      shouldRemoveClass = false
      break
    }
  }
  if (shouldRemoveClass) {
    document.body.classList.remove('SidewayModal--open')
  } else {
    document.body.classList.add('SidewayModal--open')
  }
}

export default class SidewayModal extends Component {
  componentDidMount () {
    registerModal(this, this.props.isOpen)
  }

  componentDidUpdate (prevProps) {
    if (this.props.isOpen !== prevProps.isOpen) {
      updateModal(this, this.props.isOpen)
    }
  }

  componentWillUnmount () {
    if (this.props.isOpen) {
      this.props.onRequestClose()
    }
    unregisterModal(this)
  }

  render () {
    const {
      contentLabel = '',
      children,
      onRequestClose,
      shouldCloseOnOverlayClick,
      size = 'small',
      fullWidth = false,
      canClose = true,
      noPadding = false
    } = this.props

    return (
      <Modal
        {...this.props}
        contentLabel={contentLabel}
        overlayClassName={css(styles.modalOverlay)}
        className={css(
          styles.modalContent,
          styles[size],
          fullWidth && styles.fullWidth,
          noPadding && styles.noPadding
        )}
        shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      >
        {canClose &&
          <div className={css(styles.headerBar)}>
            <Icon
              name='close'
              className={css(styles.closeIcon)}
              fill={colors.brandgreen}
              style={{
                height: 32,
                width: 32
              }}
              onClick={onRequestClose}
            />
          </div>}
        <div
          ref={node => {
            this.modalInner = node
          }}
          className={css(
            styles.modalInner,
            size === 'small' ? styles.smallModalInner : styles.largeModalInner,
            !canClose && size === 'small' && styles.smallLessBottomPadding,
            noPadding && styles.noPadding
          )}
        >
          {cloneElement(children, { closeModal: onRequestClose })}
        </div>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  modalOverlay: {
    // ...commonStyles.opaqueBg('rgba(255, 255, 255, 0.98)'),
    position: 'fixed',
    top: 0,
    right: 0,
    // bottom: 0,
    left: 0,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    zIndex: 200
  },
  modalContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    background: colors.white,
    backgroundClip: 'padding-box',
    width: 'calc(100% - 16px)',
    maxWidth: breakpoints.phone,
    zIndex: 201
  },
  small: {
    ...commonStyles.drawnBorder(true, true, true, true, colors.midgray),
    marginTop: '-12.5vh',
    marginRight: 'auto',
    marginBottom: '0vh',
    marginLeft: 'auto'
  },
  large: {
    width: '100%',
    maxHeight: 'calc(100vh - 16px)',
    margin: '8px auto',
    [mediaQueries.tablet]: {
      ...commonStyles.drawnBorder(true, true, true, true, colors.midgray),
      margin: '32px auto',
      width: 'calc(100% - 16px)',
      maxHeight: 'calc(100vh - 64px)',
      maxWidth: 500
    }
  },
  fullWidth: {
    [mediaQueries.tablet]: {
      maxWidth: breakpoints.desktop
    }
  },
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 'calc(100% - 2px)',
    height: 48,
    marginTop: 1,
    padding: 8,
    background: colors.white,
    zIndex: 202
  },
  closeIcon: {
    cursor: 'pointer'
  },
  modalInner: {
    width: '100%',
    paddingTop: 0,
    paddingRight: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    overflowY: 'auto',
    overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch'
  },
  smallModalInner: {
    paddingTop: 0,
    paddingRight: 16,
    paddingBottom: 48,
    paddingLeft: 16
  },
  smallLessBottomPadding: {
    paddingBottom: 16
  },
  largeModalInner: {
    [breakpoints.phone]: {
      paddingTop: 0,
      paddingRight: 16,
      paddingBottom: 16,
      paddingLeft: 16
    }
  },
  noPadding: {
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0
  }
})
