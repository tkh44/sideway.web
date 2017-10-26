import { PureComponent } from 'react'
import AvatarPoint from 'insight/AvatarPoint'
import { spring, TransitionMotion } from 'react-motion'

export default class MessageTimeline extends PureComponent {
  static defaultProps = {
    radius: 15
  };

  render () {
    return (
      <TransitionMotion
        // defaultStyles: this.getDefaultStyles(),
        styles={this.getStyles}
        willEnter={this.willEnter}
        willLeave={this.willLeave}
      >
        {currentStyles => {
          return (
            <g>
              {currentStyles.map(({ key, data, style }) => {
                return (
                  <AvatarPoint
                    key={key}
                    {...style}
                    avatar={data.user.avatar}
                    onClick={this.createClickHandler(data)}
                    onMouseEnter={this.createMouseEnterHandler(data)}
                    onMouseLeave={this.createMouseLeaveHandler(data)}
                  />
                )
              })}
            </g>
          )
        }}
      </TransitionMotion>
    )
  }

  // Perf issues when loading the whole page
  // getDefaultStyles = () => {
  //   const {
  //     data,
  //     xScale,
  //     yScale,
  //     radius
  //   } = this.props
  //
  //   return data.map(data => {
  //     return {
  //       key: data.ts + data.user.avatar,
  //       data,
  //       style: {
  //         radius: radius * 0.5,
  //         x: xScale(data.ts),
  //         y: yScale(0)
  //       }
  //     }
  //   })
  // };

  getStyles = (prevStyles = []) => {
    const {
      data,
      radius,
      xScale,
      yScale
    } = this.props

    return data.map(data => {
      return {
        key: data.ts + data.user.avatar,
        data,
        style: {
          radius: spring(radius),
          x: spring(xScale(data.ts)),
          y: spring(yScale(0))
        }
      }
    })
  };

  willEnter = config => {
    const { radius, xScale, yScale } = this.props
    return {
      radius: radius * 0.5,
      x: xScale(config.data.ts - 15000),
      y: yScale(0)
    }
  };

  willLeave = () => {
    const { radius, yScale } = this.props
    return {
      radius: spring(radius * 0.5),
      x: spring(0),
      y: spring(yScale(0))
    }
  };

  createClickHandler = data =>
    e => {
      this.props.onMessageClick(e, data)
    };

  createMouseEnterHandler = data =>
    e => {
      this.props.onMessageMouseEnter(e, data)
    };

  createMouseLeaveHandler = data =>
    e => {
      this.props.onMessageMouseLeave(e, data)
    };
}
