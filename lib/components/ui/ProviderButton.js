import withHandlers from 'recompose/withHandlers'
import { makeAuthCode } from 'utils/hawk'
import Icon from 'art/Icon'
import Button from 'ui/Button'

const COLOR_MAP = {
  twitter: 'twitterblue',
  medium: 'mediumgreen'
}

const STYLE_MAP = {
  twitter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 26,
    width: 26,
    marginRight: 8,
    fill: 'currentColor'
  },
  medium: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
    width: 26,
    marginRight: 8,
    fill: 'currentColor'
  }
}

export default withHandlers({
  handleClick: ({ nextState, provider }) =>
    () => {
      const appId = window.sideway.hawk.app.id
      let redirect = nextState || window.location.pathname
      if (redirect.includes('error') || redirect === '/500') {
        redirect = '/'
      }

      const url = `${window.sideway.server.login}/auth/${provider}?sw_app=${appId}&sw_state=${redirect}&sw_code=${makeAuthCode()}`
      window.location.assign(window.encodeURI(url))
    }
})(props => {
  return (
    <Button
      style={{
        ...props.style,
        minWidth: 220
      }}
      color={COLOR_MAP[props.provider]}
      label={props.text}
      onClick={props.handleClick}
      data-ga-on='click'
      data-ga-event-category='link-account'
      data-ga-event-action={`link-${props.provider}`}
    >
      <Icon name={props.provider} style={STYLE_MAP[props.provider]} />
      <span
        style={{
          height: 26,
          lineHeight: '26px'
        }}
      >
        {props.children ||
          'Connect to ' +
            props.provider.charAt(0).toUpperCase() +
            props.provider.slice(1)}
      </span>
    </Button>
  )
})
