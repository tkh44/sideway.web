import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'
import Popover from 'ui/Popover'
import BasicTooltip from 'ui/BasicTooltip'
import { dateToString } from 'utils/date'

class EditedIndicator extends Component {
  render () {
    const { message } = this.props

    return (
      <Popover
        component='b'
        className={css(
          styles.editedIndicator,
          message.text.indexOf('- ') === 0 && styles.listEdited
        )}
        popoverComponent={BasicTooltip}
        popoverProps={{
          tooltip: dateToString(message.modified)
        }}
      >
        <span style={{ background: 'transparent' }}>
          (edited)
        </span>
      </Popover>
    )
  }
}

const styles = StyleSheet.create({
  editedIndicator: {
    ...font.body2,
    fontWeight: 'normal',
    display: 'inline',
    color: colors.lightgray,
    marginLeft: 8,
    marginRight: 8,
    cursor: 'pointer'
  },
  listEdited: {
    marginLeft: 24
  }
})

export default EditedIndicator
