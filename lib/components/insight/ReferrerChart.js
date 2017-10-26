import { PureComponent } from 'react'
import { scaleOrdinal } from 'd3-scale'
import { arc as arcShape, pie as pieShape } from 'd3-shape'
import { spring } from 'react-motion'
import { Motion } from 'data-driven-motion'
import compose from 'recompose/compose'
import withPropsOnChange from 'recompose/withPropsOnChange'
import { clamp } from 'utils/func'

import { getHash, HASH_LENGTH } from 'utils/crc32'
import RedirectLink from 'ui/RedirectLink'
import { colors } from 'style'

const SPRING = { stiffness: 300, damping: 28 }
const MIN_LABEL_ANGLE = 2 * Math.PI * 0.090 // 9% of the circumference
const GREEN_SCALE = scaleOrdinal()
  .domain([0, HASH_LENGTH])
  .range([
    '#0d7a0d',
    '#e5f7e5',
    '#14ba14',
    '#82da82',
    '#c8efc8',
    '#54cc54',
    '#a8e5a8',
    '#0f930f',
    '#12a812',
    '#095809'
  ])

function getMidAngle (startAngle, endAngle) {
  return startAngle + (endAngle - startAngle) / 2
}

export default compose(
  withPropsOnChange(
    [
      'data',
      'width',
      'height',
      'paddingLeft',
      'paddingRight',
      'paddingBottom',
      'paddingTop'
    ],
    ({
      data,
      width,
      height,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight
    }) => {
      const pie = pieShape().value(d => d.y)(data)
      const outerRadius = Math.min(
        (width - paddingLeft - paddingRight) / 2,
        (height - paddingTop - paddingBottom) / 2
      )
      const innerRadius = 0.3 * outerRadius

      const arc = arcShape()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius * 0.8)
      const labelArc = arcShape()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius * 0.8)
      return {
        arc,
        labelArc,
        innerRadius,
        outerRadius,
        pie
      }
    }
  )
)(
  class ReferrerChart extends PureComponent {
    render () {
      const {
        pie,
        width,
        height,
        style
      } = this.props

      return (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio='xMinYMin'
          width={width}
          style={style}
        >
          <Motion
            data={pie}
            component={React.createElement('g', {
              width,
              height,
              transform: `translate(${width / 2}, ${height / 2})`,
              style: {
                width: '100%',
                height: 'auto'
              }
            })}
            getKey={this.getKey}
            onComponentMount={this.getDefaultStyles}
            onRender={this.getStyles}
            onRemount={this.willEnter}
            onUnmount={this.willLeave}
            render={[this.renderArc, this.renderLabel]}
          />
        </svg>
      )
    }

    renderArc = (key, data, style) => {
      const { arc, innerRadius, outerRadius } = this.props
      const fill = GREEN_SCALE(style.fill)
      return (
        <g key={key + '-🍕'}>
          <path
            fill={fill}
            fillOpacity={clamp(style.fillOpacity, 0.01, 0.99)}
            stroke={colors.white}
            strokeWidth={0.5}
            d={arc({
              innerRadius: innerRadius,
              outerRadius: outerRadius,
              startAngle: style.startAngle,
              endAngle: style.endAngle
            })}
          />
        </g>
      )
    };

    renderLabel = (key, { data }, { fillOpacity, startAngle, endAngle }) => {
      const { arc, labelArc, outerRadius } = this.props
      const polylineStroke = '#0d7a0d'

      if (endAngle - startAngle <= MIN_LABEL_ANGLE) {
        return null
      }

      const urlCentroid = labelArc.centroid({ startAngle, endAngle })
      const midAngle = getMidAngle(startAngle, endAngle)
      urlCentroid[0] = outerRadius * (midAngle < Math.PI ? 1 : -1)
      const urlTranslation = `translate(${urlCentroid})`
      const textAnchor = midAngle < Math.PI ? 'start' : 'end'

      const labelEl = (
        <text
          transform={urlTranslation}
          fill='#14ba14'
          fillOpacity={clamp(fillOpacity, 0.01, 0.99)}
          fontSize={14}
          dy='0.35em'
          textAnchor={textAnchor}
        >
          {data.label}
        </text>
      )

      const polyLinePoints = [
        arc.centroid({
          startAngle,
          endAngle
        }),
        labelArc.centroid({
          startAngle,
          endAngle
        }),
        [outerRadius * 0.95 * (midAngle < Math.PI ? 1 : -1), urlCentroid[1]]
      ]

      return (
        <g key={'label-' + key}>
          {data.label === 'direct'
            ? labelEl
            : <RedirectLink initialUrl={data.x}>
              {labelEl}
            </RedirectLink>}
          <polyline
            points={polyLinePoints}
            stroke={polylineStroke}
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
            fill='none'
            opacity={clamp(fillOpacity, 0.01, 0.3)}
          />
        </g>
      )
    };

    getKey = ({ index }) => `arc-${index}`;

    getDefaultStyles = ({ data, endAngle, startAngle }) => {
      return {
        startAngle: startAngle * 0.95,
        endAngle: endAngle * 0.95,
        fill: getHash(data.x),
        fillOpacity: 0
      }
    };

    getStyles = ({ data, endAngle, startAngle }) => {
      return {
        startAngle: spring(startAngle, SPRING),
        endAngle: spring(endAngle, SPRING),
        fill: getHash(data.x),
        fillOpacity: spring(1, SPRING)
      }
    };

    willEnter = config => {
      return {
        startAngle: Math.PI * 2,
        endAngle: Math.PI * 2,
        fill: config.style.fill,
        fillOpacity: 0
      }
    };

    willLeave = config => {
      return {
        startAngle: spring(Math.PI * 2, SPRING),
        endAngle: spring(Math.PI * 2, SPRING),
        fill: config.style.fill,
        fillOpacity: spring(1, SPRING)
      }
    };
  }
)
