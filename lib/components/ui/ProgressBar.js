import { css, StyleSheet } from 'aphrodite/no-important'
import { colors } from 'style'

export default function (
  {
    color = colors.brandgreen,
    height = 4
  }
) {
  return (
    <div
      className={css(styles.bar)}
      style={{
        height
      }}
    >
      <div className={css(styles.value, styles.indeterminateValue)} />
    </div>
  )
}

const styles = StyleSheet.create({
  bar: {
    position: 'relative',
    display: 'inline-block',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.faintgbrandgreen
  },
  value: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.brandgreen
  },
  indeterminateValue: {
    transformOrigin: 'center center',
    animationDuration: '2s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    animationName: {
      from: {
        transform: 'translate(-50%) scaleX(0.1)'
      },
      '50%': {
        transform: 'translate(0) scaleX(0.3)'
      },
      to: {
        transform: 'translate(50%) scaleX(0.1)'
      }
    }
  }
})
