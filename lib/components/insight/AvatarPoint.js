import { PureComponent } from 'react'

export default class AvatarPoint extends PureComponent {
  render () {
    const { avatar, x, y, radius, ...rest } = this.props
    const patternId = `pattern-${Math.random()}`

    return (
      <g>
        <defs>
          <pattern
            id={patternId}
            height='100%'
            width='100%'
            patternContentUnits='objectBoundingBox'
          >
            <image
              xlinkHref={avatar}
              preserveAspectRatio='none'
              width={1}
              height={1}
            />
          </pattern>
        </defs>
        <circle
          {...rest}
          cx={x}
          cy={y}
          r={radius}
          style={{
            ...rest.style,
            fill: `url(#${patternId})`,
            cursor: 'pointer'
          }}
        />
      </g>
    )
  }
}
