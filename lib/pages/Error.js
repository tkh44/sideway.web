import { Component } from 'react'
import Header from 'ui/Header'
import Background from 'ui/Background'
import FloatingBalloon from 'components/ui/FloatingBalloon'

export default class ErrorPage extends Component {
  render () {
    const { location } = this.props
    const code = location && location.pathname.indexOf('404') > -1
      ? '404'
      : 'oh dear'

    return (
      <div className='page error-page'>
        <Header />
        <Background showBackground />
        <div className='error-page-inner'>
          <div className='error-page-message'>
            <div className='error-message'>
              {code === '404' ? 'Nothing here' : code}
            </div>
          </div>
          <FloatingBalloon showMessage={false} />
        </div>
      </div>
    )
  }
}
