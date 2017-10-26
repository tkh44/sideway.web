import { Children, Component, DOM } from 'react'
import { connect } from 'react-redux'
import { get } from 'lodash'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'
import EmbededContent from 'ui/EmbededContent'
import EmbededTweet from 'ui/EmbededTweet'
import { embedActions } from 'redux/embed'
import * as domUtils from 'utils/dom'

class Embed extends Component {
  scrollToBottom = false;

  componentDidMount () {
    this.fetchEmbedDetails()
  }

  componentWillUpdate (nextProps, nextState) {
    const embed = this.props.embedDetails
    const nextEmbed = nextProps.embedDetails

    if (
      get(embed, '$$meta.fetching') &&
      !get(nextEmbed, '$$meta.fetching') &&
      get(nextEmbed, '$$meta.ok')
    ) {
      this.scrollToBottom = true
      this.scrollHeight = document.documentElement.scrollHeight
      this.wasScrolledToBottom = domUtils.isScrolledToBottom(10)
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.scrollToBottom && this.wasScrolledToBottom) {
      domUtils.scrollToBottom()
      this.scrollToBottom = false
    }
  }

  componentWillUnmount () {
    window.clearTimeout(this.fetchTimeout)
  }

  render () {
    const {
      inline,
      style,
      embedDetails,
      hideBorder,
      showLinkOnFail = false
    } = this.props

    const isLoading = get(embedDetails, '$$meta.fetching')
    const responseOk = get(embedDetails, '$$meta.ok')
    const isTwitterStatus = !!embedDetails.tweet
    const summary = embedDetails.summary || {}
    const imageOnly = summary.image &&
      !summary.description &&
      summary.image === summary.title

    if (embedDetails.embed === false && !imageOnly) {
      if (showLinkOnFail) {
        return Children.only(this.props.children)
      }

      return DOM.noscript()
    }

    return (
      <div
        className={css(
          styles.embed,
          inline && styles.inline,
          inline && imageOnly && styles.inlineImageOnly,
          isTwitterStatus && styles.tweet,
          isLoading && styles.embedIsLoading
        )}
        style={style}
      >
        {(isLoading || !embedDetails.$$meta) && this.renderLoading()}
        {responseOk === false &&
          showLinkOnFail &&
          Children.only(this.props.children)}
        {responseOk &&
          (isTwitterStatus
            ? <EmbededTweet {...embedDetails} hideBorder={hideBorder} />
            : <EmbededContent
              {...embedDetails}
              hideBorder={hideBorder}
              imageOnly={imageOnly}
              />)}
      </div>
    )
  }

  renderLoading () {
    return (
      <div key='embedded-loading' className={css(styles.loading)}>
        <div className={css(styles.loadingMessage)}>
          Loading
        </div>
      </div>
    )
  }

  fetchEmbedDetails () {
    const { dispatch, contextUrl, embedDetails } = this.props
    if (get(embedDetails, '$$meta.status')) {
      return
    }

    if (this.fetchTimeout) {
      return
    }

    this.fetchTimeout = setTimeout(
      () => {
        dispatch(embedActions.describe(contextUrl))
      },
      200
    )
  }
}

const styles = StyleSheet.create({
  embed: {
    position: 'relative',
    paddingTop: 16,
    paddingRight: 0,
    paddingBottom: 16,
    paddingLeft: 0,
    textAlign: 'left'
  },
  embedIsLoading: {},
  inline: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 16,
    paddingTop: 4,
    paddingRight: 8,
    paddingBottom: 4,
    paddingLeft: 8
  },
  inlineImageOnly: {
    width: 'auto',
    padding: 0
  },
  tweet: {
    border: 'none'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 92,
    width: '100%',
    background: colors.offwhite
  },
  loadingMessage: {
    ...font.display1,
    color: colors.faintgray
  }
})

const makeMapStateToProps = (initialState, initialProps) => {
  const url = initialProps.contextUrl

  return state => {
    return {
      embedDetails: state.embed[url] || {}
    }
  }
}

export default connect(makeMapStateToProps)(Embed)
