import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'

export default function SystemMessage ({ messageGroup }) {
  return (
    <div className={css(styles.message)}>
      {messageGroup.messages[0].text}
    </div>
  )
}

const styles = StyleSheet.create({
  message: {
    ...font.body1,
    marginTop: 16,
    marginBottom: 16,
    color: colors.lightgray,
    textAlign: 'center'
  }
})
