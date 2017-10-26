import { Component } from 'react'
import { scaleLinear, scaleTime } from 'd3-scale'
import { Axis, axisPropsFromTickScale, LEFT, BOTTOM } from 'react-d3-axis'
import { spring } from 'react-motion'
import compose from 'recompose/compose'
import defaultProps from 'recompose/defaultProps'
import withProps from 'recompose/withProps'
import { css, StyleSheet } from 'aphrodite/no-important'
import { breakpoints, colors, font, mediaQueries } from 'style'
import withPropsOnChange from 'recompose/withPropsOnChange'
import withMessageData from 'insight/with-message-data'
import withSessionData from 'insight/with-session-data'
import withReferrerData from 'insight/with-referrer-data'
import ReferrerChart from 'insight/ReferrerChart'
import SessionChart from 'insight/SessionChart'
import AudienceStatsContainer from 'insight/AudienceStatsContainer'
import MessageTimeline from 'insight/MessageTimeline'
import TimestampBarContainer from 'insight/TimestampBarContainer'
import InsightTabularData from 'insight/InsightTabularData'
// import ScaledMessagePreview from 'insight/ScaledMessagePreview'

import { dateToTimeString } from 'utils/date'
import { parseUrl } from 'utils/string'
import { format } from 'd3-format'
import { formatSessionCount } from 'utils/charts'

const SPRING = { stiffness: 300, damping: 28 }
const viewerCountFormatter = format('.0f')

// const getMessageById = (searchId, messageData) => {
//   return messageData.find(m => m.id === searchId) || {
//     ts: 0,
//     text: '',
//     user: { avatar: '', id: 0, display: '' }
//   }
// }

const ReferrerPreview = withPropsOnChange(['referrer', 'session'], ({
  referrer = {},
  session = { stops: [] }
}) => {
  const urls = Object.keys(referrer)
  const newViewers = (session.stops.find(s => s.sessionLength === 1) || {
    viewers: 0
  }).viewers
  let direct = newViewers

  const data = urls.map(url => {
    const viewers = referrer[url]
    direct -= viewers
    const parsed = parseUrl(url)
    return {
      x: url,
      y: viewers,
      label: parsed.hostname +
        (parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '')
    }
  })

  if (direct > 0) {
    data.push({ x: 'direct', y: direct, label: 'direct' })
  }

  return {
    data: data.sort((a, b) => b.y - a.y),
    viewerTotal: session.viewerTotal || 0,
    newViewers
  }
})(({ data, newViewers, viewerTotal }) => {
  return (
    <div className={css(styles.gridItem)}>
      <h1 className={css(styles.referrerHeading)}>
        New Viewers
      </h1>
      {
        // data.length === 0 && React.createElement('div', { className: css(styles.noNewVisitors) }, 'No New Visitors'),
        <ReferrerChart
          style={{
            width: '100%'
          }}
          data={data}
          viewerTotal={viewerTotal}
          paddingTop={10}
          paddingRight={100}
          paddingBottom={10}
          paddingLeft={100}
          width={breakpoints.phone * 1.333}
          height={breakpoints.phone * 0.5}
        />
      }
      <InsightTabularData
        data={data}
        renderPrimary={({ y: viewers }) => {
          return (
            <div className={css(styles.primary)}>
              {`${viewers} viewer${viewers === 1 ? '' : 's'}`}
            </div>
          )
        }}
        renderSecondary={({ x: url }) => {
          return url === 'direct'
            ? <div className={css(styles.secondary)}>
              {url}
            </div>
            : <a
              className={css(styles.secondary, styles.url)}
              href={url}
              rel='nofollow'
              target='_blank'
              >
              {url}
            </a>
        }}
        getKey={({ x: url }, i) => `referrer-${i}`}
        getDefaultStyles={({ y: viewers }) => ({
          percent: viewers / newViewers * 100,
          opacity: 0
        })}
        getStyles={({ y: viewers }) => ({
          percent: spring(viewers / newViewers * 100, SPRING),
          opacity: spring(1, SPRING)
        })}
        getWillEnter={() => ({ percent: 0, opacity: 0 })}
        getWillLeave={() => ({
          percent: spring(0, SPRING),
          opacity: spring(0, SPRING)
        })}
      />
    </div>
  )
})

const SessionPreview = withPropsOnChange(['session'], ({
  session = { stops: [] }
}) => {
  return {
    data: session.stops
      .slice(0)
      .sort((a, b) => b.sessionLength - a.sessionLength)
  }
})(({ data, maxSessionLength, selectedTimestamp }) => {
  return (
    <div className={css(styles.gridItem)}>
      <h1 className={css(styles.referrerHeading)}>
        Sessions
      </h1>
      <SessionChart
        style={{ width: '100%' }}
        data={data}
        maxSessionLength={maxSessionLength}
        paddingTop={10}
        paddingRight={100}
        paddingBottom={10}
        paddingLeft={100}
        width={breakpoints.phone * 1.333}
        height={breakpoints.phone * 0.5}
      />
      <InsightTabularData
        data={data}
        renderPrimary={({ viewers }) => {
          return (
            <div className={css(styles.primary)}>
              {`${viewers} viewer${viewers === 1 ? '' : 's'}`}
            </div>
          )
        }}
        renderSecondary={({ sessionLength }) => {
          const timeString = formatSessionCount(sessionLength)
          return (
            <div className={css(styles.secondary)}>
              {timeString}
            </div>
          )
        }}
        getKey={({ sessionLength, viewers, viewerSum }, i) => `row-${i}`}
        getDefaultStyles={({ viewers, viewerSum }) => ({
          percent: viewers / viewerSum * 100,
          opacity: 0
        })}
        getStyles={({ viewers, viewerSum }) => ({
          percent: spring(viewers / viewerSum * 100, SPRING),
          opacity: spring(1, SPRING)
        })}
        getWillEnter={() => ({ percent: 0, opacity: 0 })}
        getWillLeave={() => ({
          percent: spring(0, SPRING),
          opacity: spring(0, SPRING)
        })}
      />
    </div>
  )
})

const DataPreview = (
  { maxSessionLength, selectedTimestamp, referrer, session }
) => {
  return (
    <div className={css(styles.grid)}>
      <div className={css(styles.gridItem, styles.fullWidth)}>
        <h1 className={css(styles.time)}>
          {dateToTimeString(selectedTimestamp)}
        </h1>
      </div>
      <SessionPreview maxSessionLength={maxSessionLength} session={session} />
      <ReferrerPreview session={session} referrer={referrer} />
    </div>
  )
}

const PresenceChart = (
  {
    height,
    maxSession,
    maxViewers,
    messageData,
    onMessageClick,
    onMessageMouseEnter,
    onMessageMouseLeave,
    onMouseEnter,
    onMouseLeave,
    onTimeGroupClick,
    onTimeGroupEnter,
    onTimeGroupLeave,
    paddingBottom = 0,
    paddingLeft = 0,
    paddingRight = 0,
    paddingTop = 0,
    roomStarted,
    selectedTimestamp,
    sessionData = [],
    timestamps = [],
    style,
    width
  }
) => {
  const firstTs = Math.min.apply(
    Math,
    roomStarted ? [roomStarted, ...timestamps] : timestamps
  )

  const lastTs = Math.max(
    messageData[messageData.length - 1]
      ? messageData[messageData.length - 1].ts
      : 0,
    ...timestamps
  )

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom
  const barWidth = chartWidth / timestamps.length
  const xDomain = [firstTs, lastTs + 15000]
  const yDomain = [0, maxViewers + 1]
  const xScale = scaleTime().range([0, chartWidth]).domain(xDomain)
  const yScale = scaleLinear().rangeRound([chartHeight, 0]).domain(yDomain)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} style={style}>
      <g
        width={chartWidth}
        height={chartHeight}
        transform={`translate(${paddingLeft}, ${paddingTop})`}
        style={{
          width: '100%',
          height: 'auto'
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <g>
          <Axis
            values={yScale.ticks(5)}
            position={yScale.copy()}
            format={viewerCountFormatter}
            range={yScale.range()}
            style={{
              orient: LEFT,
              tickSizeInner: 0,
              tickSizeOuter: 0,
              tickPadding: 6,
              strokeColor: colors.lightgray,
              tickFont: font.sansSerifFamily,
              tickFontSize: 15
            }}
          />

        </g>
        <TimestampBarContainer
          barWidth={barWidth}
          chartHeight={chartHeight}
          chartWidth={chartWidth}
          maxSession={maxSession}
          onTimeGroupClick={onTimeGroupClick}
          onTimeGroupEnter={onTimeGroupEnter}
          onTimeGroupLeave={onTimeGroupLeave}
          selectedTimestamp={selectedTimestamp}
          sessionData={sessionData}
          xScale={xScale}
          yScale={yScale}
        />
        <MessageTimeline
          data={messageData}
          radius={15}
          onMessageClick={onMessageClick}
          onMessageMouseEnter={onMessageMouseEnter}
          onMessageMouseLeave={onMessageMouseLeave}
          xScale={xScale}
          yScale={yScale}
        />
        <g transform={`translate(0, ${chartHeight})`}>
          <Axis
            values={xScale.ticks(5)}
            position={xScale.copy()}
            format={tick => dateToTimeString(tick)}
            range={xScale.range()}
            style={{
              orient: BOTTOM,
              tickSizeInner: 0,
              tickSizeOuter: 0,
              tickPadding: 6,
              strokeColor: colors.lightgray,
              tickFont: font.sansSerifFamily,
              tickFontSize: 15
            }}
          />

        </g>
      </g>
    </svg>
  )
}

export default compose(withSessionData(), withReferrerData(), withMessageData)(
  class AudiencePresence extends Component {
    constructor (props, context) {
      super(props, context)

      const messageData = this.props.messageData
      this.state = {
        selectedMessageId: messageData[0] && messageData[0].id,
        selectedTimestamp: (props.referrerData[0] &&
          props.referrerData[0].ts) ||
          (props.sessionData[0] && props.sessionData[0].ts) ||
          null,
        holdForReentry: true,
        clientX: 0,
        clientY: 0
      }
    }

    componentWillReceiveProps (nextProps) {
      if (nextProps.room.status !== 'active') {
        return
      }

      const nextState = {}

      if (this.props.messageData.length < nextProps.messageData.length) {
        nextState.selectedMessageId = nextProps.messageData[
          nextProps.messageData.length - 1
        ].id
      }

      if (this.props.sessionData.length < nextProps.sessionData.length) {
        nextState.selectedTimestamp = nextProps.sessionData[
          nextProps.sessionData.length - 1
        ].ts
      }

      if (Object.keys(nextState).length) {
        this.setState(nextState)
      }
    }

    render () {
      const {
        avgViewers,
        lastSessionTimestamp,
        maxSession,
        maxViewers,
        medianSession,
        referrers,
        room,
        sessionData
      } = this.props

      // Don't render the graph until we have full dataset
      if (!lastSessionTimestamp) {
        return null
      }

      const selectedTimestamp = this.state.selectedTimestamp
      // const selectedMessage = getMessageById(this.state.selectedMessageId, messageData)
      // const showMessagePreview = this.state.selectedMessageId && selectedMessage

      return (
        <div className={css(styles.graphWrapper)}>
          <AudienceStatsContainer
            className={css(styles.statWrapper)}
            avgViewers={avgViewers}
            medianSession={medianSession}
            maxSession={maxSession}
            maxViewers={maxViewers}
          />
          <div className={css(styles.svgWrapper)}>
            <PresenceChart
              {...this.props}
              width={breakpoints.large}
              height={breakpoints.phone}
              paddingTop={20}
              paddingRight={40}
              paddingBottom={40}
              paddingLeft={40}
              style={{
                width: '100%'
              }}
              selectedTimestamp={
                this.state.timeGroupChildHovered
                  ? this.state.selectedTimestamp
                  : null
              }
              roomStarted={room.started}
              onMouseEnter={this.handleChartEnter}
              onMouseLeave={this.handleChartLeave}
              onTimeGroupClick={this.handleTimeGroupClick}
              onTimeGroupEnter={this.handleTimeGroupEnter}
              onTimeGroupLeave={this.handleTimeGroupLeave}
              onMessageClick={this.handleMessageClick}
              onMessageMouseEnter={this.handleMessageMouseEnter}
              onMessageMouseLeave={this.handleMessageMouseLeave}
            />
          </div>
          {
            // React.createElement(ScaledMessagePreview, {
            //   message: selectedMessage,
            //   maxWidth: 320,
            //   maxHeight: 180,
            //   x: this.state.clientX,
            //   y: this.state.clientY
            // }),
            <DataPreview
              maxSessionLength={maxSession}
              referrer={referrers[selectedTimestamp]}
              session={sessionData.find(
                group => selectedTimestamp === group.ts
              )}
              selectedTimestamp={selectedTimestamp}
            />
          }
        </div>
      )
    }

    handleChartEnter = e => {
      this.setState({ holdForReentry: false })
    };

    handleChartLeave = e => {
      // if (this.state.holdForReentry || this.state.selectedTimestamp !== null) return
      // this.setState({ selectedTimestamp: this.state.prevSelectedTimestamp })
    };

    handleTimeGroupClick = (e, ts) => {
      // this.setState({ holdForReentry: true })
      this.setState({ holdForReentry: true, selectedTimestamp: ts })
    };

    handleTimeGroupEnter = (e, ts) => {
      if (this.state.holdForReentry || this.state.selectedTimestamp === ts) {
        return
      }
      this.setState({ selectedTimestamp: ts, timeGroupChildHovered: true })
    };

    handleTimeGroupLeave = (e, ts) => {
      if (this.state.holdForReentry) return

      if (this.state.timeGroupChildHovered === true) {
        this.setState({ timeGroupChildHovered: false })
      }
    };

    handleMessageClick = (evt, message) => {
      if (this.state.selectedMessageId !== message.id) {
        this.setState(
          {
            selectedMessageId: message.id,
            clientX: evt.clientX,
            clientY: evt.clientY
          },
          () => {
            this.hoverTimeout = null
          }
        )
      }
    };

    handleMessageMouseEnter = (evt, message) => {
      // if (!this.hoverTimeout) {
      //   if (this.state.selectedMessageId !== message.id) {
      //     this.setState({ selectedMessageId: message.id, clientX: pos.clientX, clientY: pos.clientY }, () => {
      //       this.hoverTimeout = null
      //     })
      //   }
      // }
    };

    handleMessageMouseLeave = (evt, message) => {
      // window.clearTimeout(this.hoverTimeout)
      // this.hoverTimeout = null
    };
  }
)

const styles = StyleSheet.create({
  graphWrapper: {
    ...font.body2,
    maxWidth: breakpoints.desktop,
    width: '100%',
    margin: '0 auto'
  },
  statWrapper: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    maxWidth: breakpoints.desktop,
    margin: '0 auto',
    [mediaQueries.tablet]: {
      margin: '16px auto'
    }
  },
  svgWrapper: {
    position: 'relative',
    width: '100%'
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0
  },
  gridItem: {
    flex: 1,
    minWidth: 250,
    paddingTop: 8,
    paddingRight: 8,
    paddingBottom: 8,
    paddingLeft: 8
  },
  fullWidth: {
    flex: 1,
    minWidth: '92%',
    width: '92%',
    paddingTop: 8,
    paddingRight: 8,
    paddingBottom: 0,
    paddingLeft: 8
  },
  time: {
    ...font.title,
    color: colors.lightgray
  },
  referrerHeading: {
    ...font.body1,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    color: colors.lightgray
  },
  primary: {
    ...font.caption,
    flex: '1 0 25%',
    flexWrap: 'wrap',
    minWidth: '25%'
  },
  url: {
    color: colors.brandgreen,
    textDecoration: 'underline'
  },
  direct: {
    color: colors.lightgray,
    textDecoration: 'none'
  },
  secondary: {
    ...font.caption,
    flex: '1 1 75%',
    textAlign: 'center'
  },
  noNewVisitors: {
    ...font.body1,
    color: colors.midgray,
    paddingTop: 32,
    textAlign: 'center'
  }
})
