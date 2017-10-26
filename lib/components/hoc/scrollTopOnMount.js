import { Component } from 'react'

export default WrappedComponent => {
  return class ScrollTopOnMount extends Component {
    componentDidMount () {
      window.scrollTo(0, 0)
    }

    render () {
      return <WrappedComponent {...this.props} />
    }
  }
}
