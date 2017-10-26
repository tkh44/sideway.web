import { Component } from 'react'
import Icon from 'art/Icon'
import BasicTooltip from 'ui/BasicTooltip'
import Popover from 'ui/Popover'

class TooltipIcon extends Component {
  render () {
    const {
      className,
      style,
      arrowSize = 4,
      tooltip,
      ...passable
    } = this.props

    return (
      <Popover
        className={className}
        style={style}
        arrowSize={arrowSize}
        component={Icon}
        popoverComponent={BasicTooltip}
        popoverProps={{ tooltip }}
        {...passable}
      />
    )
  }
}

export default TooltipIcon
