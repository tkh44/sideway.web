import { css, StyleSheet } from 'aphrodite/no-important'
import { colors } from '../../style'
import Icon from '../art/Icon'

const noop = () => {}

export default function Toggle ({ label, value, disabled, onChange }) {
  return (
    <div
      className={css(styles.toggle, disabled && styles.disabled)}
      onClick={disabled ? noop : onChange}
      role='checkbox'
      tabIndex={0}
      aria-checked={Boolean(value)}
      aria-label={label}
    >
      <Icon
        name={value ? 'checked' : 'unchecked'}
        className={css(styles.checkBox)}
        style={{
          height: 24,
          width: 24
        }}
        fill={disabled ? colors.lightgray : 'currentColor'}
      />
      <p className={css(styles.copy)}>
        {label}
      </p>
    </div>
  )
}

const styles = StyleSheet.create({
  toggle: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    color: colors.darkgray,
    ':hover': {
      color: colors.darkgray
    },
    ':focus': {
      color: colors.brandgreen
    }
  },
  disabled: {
    color: colors.lightgray
  },
  checkBox: {
    flexShrink: 0,
    paddingLeft: 4
  },
  copy: {
    flexShrink: 1,
    color: colors.darkgray,
    paddingTop: 8,
    paddingRight: 8,
    paddingBottom: 8,
    paddingLeft: 12
  }
})
