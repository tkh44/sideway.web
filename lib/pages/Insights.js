import { Component } from 'react'
import { get } from 'lodash'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import roomLoader from 'room/room-loader'
import { Request, Subscribe } from 'react-nes'
import { css, StyleSheet } from 'aphrodite/no-important'
import { breakpoints, colors, font, mediaQueries } from 'style'
import Header from 'ui/Header'
import Footer from 'ui/Footer'
import StandardPage from 'ui/StandardPage'
import AudienceGraph from 'insight/AudiencePresence'
import { getRoomById } from 'selectors/rooms'
import { getInsightById } from 'selectors/insights'
import { isLoggedIn } from 'selectors/auth'
import { insightActions } from 'redux/insights'

function InsightsLoading () {
  return (
    <div className={css(styles.infoContent)}>
      <h1 className={css(styles.pageTitle)}>
        Loading Insights
      </h1>
    </div>
  )
}

function InsightsError ({ error = { statusCode: 500 } }) {
  let errorTitle
  let errorSubtitle

  switch (error.statusCode) {
    case 404:
      errorTitle = '404️‍️'
      errorSubtitle = 'The conversation could not be found'
      break
    case 403:
      errorTitle = 'Whoops'
      errorSubtitle = 'You must be a participant to view conversation insights'
      break
    default:
      errorTitle = 'Error'
      errorSubtitle = 'There was an error loading conversation insights'
      break
  }

  return (
    <div className={css(styles.infoContent)}>
      <h1 className={css(styles.pageTitle)}>
        {errorTitle}
      </h1>
      <h4 className={css(styles.pageSubtitle)}>
        {errorSubtitle}
      </h4>
      {__DEVELOPMENT__ &&
        <pre>
          {JSON.stringify(error, null, 2)}
        </pre>}
    </div>
  )
}

function InsightContent ({ room, dispatch, profile, insights }) {
  return (
    <div>
      <h1 className={css(styles.pageTitle)}>
        {room.title}
      </h1>
      <div className={css(styles.gridContainer)}>
        <GridItem>
          <AudienceGraph
            dispatch={dispatch}
            profile={profile}
            insightData={insights}
            room={room}
          />
        </GridItem>
      </div>
    </div>
  )
}

const GridItem = props => {
  return <div className={css(styles.gridItem)} {...props} />
}

const makeMapStateToProps = (initialState, initialProps) => {
  const roomId = initialProps.match.params.roomId

  return state => {
    return {
      connected: state.nes.connected,
      connecting: state.nes.connecting,
      loggedIn: isLoggedIn(state),
      profile: state.profile,
      room: getRoomById(state, roomId),
      insights: getInsightById(state, roomId),
      roomId
    }
  }
}

export default compose(
  roomLoader({ redirectOnError: false }),
  connect(makeMapStateToProps)
)(
  class Insights extends Component {
    render () {
      const { connected, roomId, isModal } = this.props

      return (
        <StandardPage
          header={!isModal && Header}
          footer={!isModal && Footer}
          maxWidth={breakpoints.large}
        >
          {connected &&
            <Subscribe
              path={`/room/${roomId}/insight`}
              handler={this.handleInsightSubUpdate}
              children={this.renderSubscription}
            />}
        </StandardPage>
      )
    }

    renderSubscription = ({ subscribing, subscribed, error }) => {
      const { roomId } = this.props

      if (error) {
        if (
          !(error.data &&
            error.data.message &&
            error.data.message === 'Room is not active')
        ) {
          return <InsightsError error={error} />
        }
      } else if (subscribing || !subscribed) {
        return null
      }

      return (
        <Request
          path={`/room/${roomId}/insight`}
          method='GET'
          onResponse={this.handleInsightsResponse}
          children={this.renderRequest}
        />
      )
    };

    renderRequest = ({ fetching, error }) => {
      const { dispatch, profile, room, insights } = this.props

      if (error) {
        return <InsightsError error={error} />
      }

      if (fetching || (room && get(room, '$$meta.fetching', true))) {
        return <InsightsLoading />
      }

      return (
        <InsightContent
          dispatch={dispatch}
          profile={profile}
          insights={insights}
          room={room}
        />
      )
    };

    handleInsightSubUpdate = (message, flags) => {
      this.props.dispatch(
        insightActions.subUpdate({ id: this.props.roomId, message, flags })
      )
    };

    handleInsightsResponse = (error, payload, statusCode) => {
      this.props.dispatch(
        insightActions.getRoom({
          id: this.props.roomId,
          error,
          payload,
          statusCode
        })
      )
    };
  }
)

const styles = StyleSheet.create({
  infoContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 32,
    paddingRight: 32,
    paddingBottom: 32,
    paddingLeft: 32
  },
  pageTitle: {
    ...font.display1,
    marginTop: 0,
    marginBottom: 16,
    letterSpace: '-.125em',
    color: colors.midgray,
    textAlign: 'center'
  },
  pageSubtitle: {
    ...font.body2,
    letterSpace: '-.125em',
    lineHeight: 1,
    color: colors.midgray,
    textAlign: 'center',
    [mediaQueries.phone]: {
      ...font.title
    }
  },
  gridContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  gridItem: {
    display: 'flex',
    flex: '1 1 50%'
  }
})
