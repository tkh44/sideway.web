import { Component, PropTypes, DOM } from 'react'
import cn from 'classnames/dedupe'

class Background extends Component {
  static propTypes = {
    backgrounds: PropTypes.object,
    bgName: PropTypes.string,
    loadBackground: PropTypes.func
  };

  static defaultProps = {
    bgName: 'harvest'
  };

  componentDidMount () {
    const { bgName, showBackground } = this.props

    if (showBackground && bgName) {
      const className = cn('background-container', bgName)

      className.split(' ').forEach(name => document.body.classList.add(name))
    }
  }

  componentWillUpdate (nextProps, nextState) {
    if (!this.props.showBackgroud || nextProps.bgName !== this.props.bgName) {
      document.body.classList.remove(this.props.bgName)
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.showBackground) {
      const className = cn('background-container', this.props.bgName)
      className.split(' ').forEach(name => document.body.classList.add(name))
    }
  }

  componentWillUnmount () {
    document.body.classList.remove(this.props.bgName)
  }

  render () {
    return DOM.noscript()
  }
}

export default Background
