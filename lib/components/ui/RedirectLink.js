import { PureComponent } from 'react'

class RedirectLink extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      href: this.createRedirectUrl(this.props.initialUrl)
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.initialUrl !== this.props.initialUrl) {
      this.setState({ href: this.createRedirectUrl(nextProps.initialUrl) })
    }
  }

  render () {
    const { className, children, style } = this.props

    return (
      <a
        className={className}
        style={style}
        href={this.state.href}
        target='_blank'
        rel='noopener'
        onMouseOver={this.handleMouseOver}
        onMouseDown={this.handleMouseDown}
      >
        {children}
      </a>
    )
  }

  handleMouseDown = () => {
    this.setState({ href: this.createRedirectUrl(this.props.initialUrl) })
  };

  handleMouseOver = () => {
    this.setState({ href: this.getFullUrl(this.props.initialUrl) })
  };

  createRedirectUrl (url) {
    if (
      url.charAt(0) === '/' ||
      url.indexOf(`${window.sideway.server.embed}/redirect?url=`) === 0
    ) {
      return url
    }

    let formattedUrl
    if (!(url.indexOf('http://') === 0 || url.indexOf('https://') === 0)) {
      formattedUrl = 'unknown://' + url
    } else {
      formattedUrl = url
    }

    return `${window.sideway.server.embed}/redirect?url=${encodeURIComponent(formattedUrl)}`
  }

  getFullUrl (url) {
    let fullUrl = url

    if (fullUrl.charAt(0) === '/') {
      return fullUrl
    }

    if (
      !(fullUrl.indexOf('http://') === 0 || fullUrl.indexOf('https://') === 0)
    ) {
      fullUrl = 'http://' + fullUrl
    }

    return fullUrl
  }
}

export default RedirectLink
