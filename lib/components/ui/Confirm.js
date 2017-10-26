import { PureComponent } from 'react'
import cn from 'classnames'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'
import ClickOutside from 'ClickOutside'
import Button from 'ui/Button'

export default class Confirm extends PureComponent {
  static defaultProps = {
    message: 'Are you sure?',
    cancelText: 'Cancel',
    confirmText: 'Yes',
    cancelButtonColor: 'gray',
    confirmButtonColor: 'red',
    loading: false,
    onCancel: () => {},
    onConfirm: () => {}
  };

  render () {
    const {
      cancelButtonColor,
      confirmButtonColor,
      children,
      className,
      message,
      onCancel,
      onConfirm,
      cancelText,
      confirmText,
      loading,
      style
    } = this.props

    return (
      <div className={cn(css(styles.confirming), className)} style={style}>
        {children}
        <ClickOutside
          className={css(styles.confirmChanges)}
          onClickOutside={onCancel}
        >
          <p className={css(styles.metaSure)}>
            {message}
          </p>
          <div className={css(styles.confirmForm)}>
            <Button
              color={cancelButtonColor}
              textOnly
              label={cancelText}
              onClick={onCancel}
            >
              {cancelText}
            </Button>
            <Button
              color={confirmButtonColor}
              textOnly
              label={confirmText}
              onClick={onConfirm}
              disabled={loading}
              loading={loading}
            >
              {confirmText}
            </Button>
          </div>
        </ClickOutside>
      </div>
    )
  }
}

const styles = StyleSheet.create({
  confirming: {
    ...font.body2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: colors.offwhite,
    borderRadius: 2
  },
  confirmChanges: {
    flex: '1',
    padding: 8,
    borderRadius: 2
  },
  confirmForm: {
    display: 'flex',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingright: 0,
    paddingBottom: 8,
    paddingLeft: 0
  },
  metaSure: {
    textAlign: 'center'
  }
})
