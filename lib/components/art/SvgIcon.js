import { Component, PropTypes } from 'react'
import shallowCompare from 'shallow-compare'
import cn from 'classnames'

const SVG_ATTRIBUTES = ['fill', 'path']

const swapClassName = (props, extraProps) => {
  if (props.className) {
    const newProps = { ...props, ...extraProps }
    newProps.class = props.className
    delete newProps.className
    return newProps
  }

  return { ...props, ...extraProps }
}

const svgIcon = (WrappedComponent, baseClassName = '') => {
  class SvgIcon extends Component {
    static propTypes = {
      fill: PropTypes.string,
      height: PropTypes.number,
      width: PropTypes.number
    };

    static defaultProps = {};

    shouldComponentUpdate (nextProps, nextState) {
      return shallowCompare(this, nextProps, nextState)
    }

    render () {
      const svgStyles = {}

      SVG_ATTRIBUTES.forEach(attribute => {
        const style = this.props[attribute]

        if (style) {
          svgStyles[attribute] = style
        }
      })

      if (WrappedComponent) {
        return (
          <i
            className={cn('svg-icon icon', this.props.className, baseClassName)}
          >
            <WrappedComponent {...swapClassName(this.props, svgStyles)} />
          </i>
        )
      }
      return null
    }
  }

  return SvgIcon
}

export default svgIcon
