import { Component } from 'react'

export default function asyncComponent (getComponent) {
  return class AsyncComponent extends Component {
    static NextComponent = null;
    state = { NextComponent: AsyncComponent.NextComponent };

    componentWillMount = async () => {
      if (this.state.NextComponent) {
        return
      }

      try {
        const NextComponent = await getComponent()
        AsyncComponent.NextComponent = NextComponent
        this.setState({ NextComponent })
      } catch (err) {
        console.error(err)
      }
    };

    render () {
      const { NextComponent } = this.state
      if (NextComponent) {
        return <NextComponent {...this.props} />
      }
      return null
    }
  }
}
