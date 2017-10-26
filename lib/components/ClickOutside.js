import { Component, PropTypes } from 'react'
import { get, omit } from 'lodash'
import listener from 'simple-listen'

class ClickOutside extends Component {
  static propTypes = {
    children: PropTypes.node,
    ignoreAttr: PropTypes.string,
    onClickOutside: PropTypes.func.isRequired
  };

  static defaultProps = {
    ignoreAttr: ''
  };

  componentDidMount () {
    this.listener = listener(
      document,
      'click touchend',
      this.handleClickOutside,
      true
    )
  }

  componentWillUnmount () {
    this.listener && this.listener()
  }

  render () {
    return (
      <div
        {...omit(this.props, ['ignoreAttr', 'onClickOutside'])}
        ref={el => {
          this.container = el
        }}
      />
    )
  }

  handleClickOutside = e => {
    const { onClickOutside, ignoreAttr } = this.props

    if (ignoreAttr) {
      let i = 3
      let element = e.target
      let hasIgnoreAttr = false

      while (i--) {
        hasIgnoreAttr = get(element, ['attributes', ignoreAttr])
        if (hasIgnoreAttr) {
          return
        }

        if (!element.parentNode) {
          break
        }
        element = element.parentNode
      }
    }

    if (this.container && !this.container.contains(e.target)) {
      onClickOutside(e)
    }
  };
}

export default ClickOutside
