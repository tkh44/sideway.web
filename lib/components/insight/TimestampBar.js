import { PureComponent } from 'react'
import { getGreenColor } from 'utils/charts'

export default class TimestampBar extends PureComponent {
  render () {
    const {
      x,
      y,
      height,
      width,
      stops,
      maxSessionLength,
      ts,
      ...rest
    } = this.props

    const gradientId = `🖌️-${ts}`

    let stopEls = this.generateGradientStops(stops, maxSessionLength)

    return (
      <g>
        <defs>
          <linearGradient
            key={gradientId}
            id={gradientId}
            x1={0}
            x2={0}
            y1={0}
            y2={1}
          >
            {stopEls}
          </linearGradient>
        </defs>
        <rect
          key={gradientId + '-📊'}
          x={x}
          y={y}
          height={height}
          width={width}
          fill={`url(#${gradientId})`}
          stroke='none'
          strokeWidth={0}
          style={{
            cursor: 'pointer'
          }}
          {...rest}
          onClick={this.handleClick}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        />
      </g>
    )
  }

  handleClick = e => {
    const {
      ts
    } = this.props
    this.props.onClick(e, ts)
  };

  handleMouseEnter = e => {
    const {
      ts
    } = this.props
    this.props.onMouseEnter(e, ts)
  };

  handleMouseLeave = e => {
    const {
      ts
    } = this.props
    this.props.onMouseLeave(e, ts)
  };

  generateGradientStops (stops, maxSessionLength) {
    let stopEls = []
    let total = 0
    for (let i = 0; i < stops.length; ++i) {
      const { offset, sessionLength } = stops[i]
      const stopColor = getGreenColor(sessionLength / maxSessionLength)

      if (i === 0) {
        stopEls.push(
          <stop
            key={total + '-' + sessionLength}
            offset={total}
            style={{ stopColor }}
          />
        )
      }

      stopEls.push(
        <stop
          key={offset + total + '-' + sessionLength}
          offset={offset + total}
          style={{ stopColor }}
        />
      )

      const next = stops[i + 1] || stops[i]
      stopEls.push(
        <stop
          key={offset + total + '-' + sessionLength + '-hard-stop'}
          offset={offset + total}
          style={{
            stopColor: getGreenColor(next.sessionLength / maxSessionLength)
          }}
        />
      )

      total += offset
    }

    return stopEls
  }
}
