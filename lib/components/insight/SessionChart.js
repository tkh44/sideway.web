import { PureComponent } from 'react'
import { arc as arcShape, pie as pieShape } from 'd3-shape'
import { spring } from 'react-motion'
import compose from 'recompose/compose'
import defaultProps from 'recompose/defaultProps'
import withPropsOnChange from 'recompose/withPropsOnChange'
import { colors } from 'style'
import { Motion } from 'data-driven-motion'
import { clamp } from 'utils/func'
import { formatSessionCount, getGreenColor } from 'utils/charts'

const SPRING = { stiffness: 300, damping: 28 }
const MIN_LABEL_ANGLE = 2 * Math.PI * 0.090 // 9% of the circumference

function getMidAngle (startAngle, endAngle) {
  return startAngle + (endAngle - startAngle) / 2
}

function getArcValue (d) {
  return d.viewers
}

function createAsterPlotCalc (
  innerRadius,
  outerRadius,
  maxSessionLengthForTime
) {
  return function (angle, { sessionLength = maxSessionLengthForTime / 2 } = {}) {
    return sessionLength /
      maxSessionLengthForTime *
      (outerRadius * 0.8 - innerRadius) +
      innerRadius
  }
}

function sortArcBySessionLength (a, b) {
  return b.sessionLength - a.sessionLength
}

export default compose(
  defaultProps({ data: [] }),
  withPropsOnChange(
    [
      'width',
      'height',
      'paddingLeft',
      'paddingRight',
      'paddingBottom',
      'paddingTop'
    ],
    ({
      width,
      height,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight
    }) => {
      const outerRadius = Math.min(
        (width - paddingLeft - paddingRight) / 2,
        (height - paddingTop - paddingBottom) / 2
      )
      const innerRadius = 0.3 * outerRadius
      return { innerRadius, outerRadius }
    }
  ),
  withPropsOnChange(['data', 'innerRadius', 'outerRadius'], ({
    data,
    innerRadius,
    outerRadius
  }) => {
    const pie = pieShape().value(getArcValue).sort(sortArcBySessionLength)(
      data
    )
    const maxSessionLengthForTime = Math.max(
      ...pie.map(d => d.data.sessionLength).filter(Boolean)
    )

    const arc = arcShape()
      .innerRadius(innerRadius)
      .outerRadius(
        createAsterPlotCalc(innerRadius, outerRadius, maxSessionLengthForTime)
      )
    const labelArc = arcShape()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius * 0.85)
    return { arc, labelArc, pie }
  })
)(
  class SessionChart extends PureComponent {
    state = { hoveredArc: null };

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

    renderArc = (key, { data }, style) => {
      const { arc } = this.props
      const fill = getGreenColor(clamp(style.fill, 0.01, 0.99))

      return (
        <g
          key={key + '-slice'}
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => this.setState({ hoveredArc: data.sessionLength })}
          onMouseLeave={() => this.setState({ hoveredArc: null })}
        >
          <path
            fill={fill}
            fillOpacity={clamp(style.fillOpacity, 0.01, 0.99)}
            stroke={colors.white}
            strokeWidth={0.5}
            d={arc(
              {
                startAngle: style.startAngle,
                endAngle: style.endAngle
              },
              data
            )}
          />
        </g>
      )
    };

    renderLabel = (key, { data }, { fillOpacity, startAngle, endAngle }) => {
      const { arc, labelArc, outerRadius } = this.props

      if (data.sessionLength !== this.state.hoveredArc) {
        if (endAngle - startAngle <= MIN_LABEL_ANGLE) {
          return null
        }
      }

      const urlCentroid = labelArc.centroid({ startAngle, endAngle })
      const midAngle = getMidAngle(startAngle, endAngle)
      urlCentroid[0] = outerRadius * (midAngle < Math.PI ? 1 : -1)
      const urlTranslation = `translate(${urlCentroid})`
      const textAnchor = midAngle < Math.PI ? 'start' : 'end'

      const polyLinePoints = [
        arc.centroid(
          {
            startAngle,
            endAngle
          },
          data
        ),
        labelArc.centroid({
          startAngle,
          endAngle
        }),
        [outerRadius * 0.95 * (midAngle < Math.PI ? 1 : -1), urlCentroid[1]]
      ]

      return (
        <g key={'label-' + key}>
          <text
            transform={urlTranslation}
            fill={colors.darkgray}
            fillOpacity={clamp(fillOpacity, 0.01, 0.99)}
            fontSize={18}
            dy='0.35em'
            textAnchor={textAnchor}
          >
            {formatSessionCount(data.sessionLength)}
          </text>
          <polyline
            points={polyLinePoints}
            stroke='#0d7a0d'
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
        fill: data.sessionLength / this.props.maxSessionLength,
        fillOpacity: 0
      }
    };

    getStyles = ({ data, endAngle, startAngle }) => {
      return {
        startAngle: spring(startAngle, SPRING),
        endAngle: spring(endAngle, SPRING),
        fill: spring(data.sessionLength / this.props.maxSessionLength, SPRING),
        fillOpacity: spring(1, SPRING)
      }
    };

    willEnter = () => {
      return {
        startAngle: Math.PI * 2,
        endAngle: Math.PI * 2,
        fill: 0.1,
        fillOpacity: 0
      }
    };

    willLeave = config => {
      return {
        startAngle: spring(Math.PI * 2, SPRING),
        endAngle: spring(Math.PI * 2, SPRING),
        fill: spring(config.style.fill.val, SPRING),
        fillOpacity: spring(1, SPRING)
      }
    };
  }
)
