import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import RedirectLink from 'ui/RedirectLink'
import * as domUtils from 'utils/dom'

export default class EmbedImage extends Component {
  static defaultProps = {
    summary: {}
  };

  scrollToBottom = false;

  state = {
    loaded: false
  };

  componentDidMount () {
    if (this.props.summary && this.props.summary.image) {
      this.scrollToBottom = domUtils.isScrolledToBottom(10)
    }
  }

  componentWillUpdate (nextProps, nextState) {
    if (!this.state.loaded && nextState.loaded) {
      this.scrollToBottom = domUtils.isScrolledToBottom(10)
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.scrollToBottom) {
      domUtils.scrollToBottom()
      this.scrollToBottom = false
    }
  }

  render () {
    const { summary = {} } = this.props

    return (
      <div
        ref={node => {
          this.node = node
        }}
        className={css(styles.wrapper)}
      >
        <RedirectLink
          className={css(styles.imageLink)}
          initialUrl={summary.url}
        >
          <img
            className={css(styles.image)}
            src={summary.image}
            onLoad={this.handleLoad}
          />
        </RedirectLink>
      </div>
    )
  }

  handleLoad = () => {
    if (this.scrollToBottom) {
      domUtils.scrollToBottom()
    }
    this.setState({ loaded: true })
  };
}

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  imageLink: {
    display: 'flex',
    alignItems: 'center'
  },
  image: {
    maxHeight: 240,
    maxWidth: '100%',
    borderRadius: 2
  }
})
