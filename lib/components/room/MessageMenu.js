import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors } from 'style'

class MessageMenu extends Component {
  render () {
    return (
      <div className={css(styles.messageMenu)}>
        {this.props.children}
      </div>
    )
  }
}

const styles = StyleSheet.create({
  messageMenu: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
    backgroundColor: colors.white,
    border: `1px solid ${colors.faintgray}`,
    borderRadius: 2
  }
})

export default MessageMenu
