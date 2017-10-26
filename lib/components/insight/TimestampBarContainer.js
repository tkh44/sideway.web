import { PureComponent } from 'react'
import { spring } from 'react-motion'
import { Motion } from 'data-driven-motion'
import TimestampBar from 'insight/TimestampBar'

const SPRING = { stiffness: 300, damping: 28 }

export default class TimestampBarContainer extends PureComponent {
  render () {
    const {
      chartHeight,
      chartWidth,
      sessionData
    } = this.props

    return (
      <Motion
        data={sessionData}
        component={React.createElement('g', {
          width: chartWidth,
          height: chartHeight,
          'data-label': 'TimestampBarContainer',
          style: { width: '100%', height: 'auto' }
        })}
        getKey={this.getKey}
        onComponentMount={this.getDefaultStyles}
        onRender={this.getStyles}
        onRemount={this.willEnter}
        onUnmount={this.willLeave}
        render={this.renderBar}
      />
    )
  }

  renderBar = (key, { ts, stops }, style) => {
    const {
      maxSession,
      onTimeGroupClick,
      onTimeGroupEnter,
      onTimeGroupLeave
    } = this.props

    return (
      <TimestampBar
        key={key}
        ts={ts}
        stops={stops}
        {...style}
        maxSessionLength={maxSession}
        onClick={onTimeGroupClick}
        onMouseEnter={onTimeGroupEnter}
        onMouseLeave={onTimeGroupLeave}
      />
    )
  };

  getKey = ({ ts }) => ts + ''; // must be a string

  getDefaultStyles = ({ ts, viewerTotal }) => {
    const {
      barWidth,
      chartHeight,
      selectedTimestamp,
      xScale,
      yScale
    } = this.props

    return {
      x: xScale(ts),
      y: yScale(viewerTotal),
      height: chartHeight - yScale(viewerTotal),
      width: barWidth,
      fillOpacity: selectedTimestamp === null || ts === selectedTimestamp
        ? 1
        : 0.25
    }
  };

  getStyles = ({ ts, viewerTotal }) => {
    const {
      barWidth,
      chartHeight,
      selectedTimestamp,
      xScale,
      yScale
    } = this.props

    return {
      x: spring(xScale(ts), SPRING),
      y: spring(yScale(viewerTotal), SPRING),
      height: spring(chartHeight - yScale(viewerTotal), SPRING),
      width: spring(barWidth, SPRING),
      fillOpacity: spring(
        selectedTimestamp === null || ts === selectedTimestamp ? 1 : 0.25,
        SPRING
      )
    }
  };

  willEnter = config => {
    const {
      chartWidth,
      sessionData,
      selectedTimestamp,
      ts,
      xScale,
      yScale
    } = this.props

    return {
      x: xScale(config.data.ts),
      y: yScale(0),
      height: 0,
      width: chartWidth / sessionData.length,
      fillOpacity: spring(
        selectedTimestamp === null || ts === selectedTimestamp ? 1 : 0.25
      )
    }
  };

  willLeave = () => null;
}
