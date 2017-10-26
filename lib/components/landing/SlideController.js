import { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ActionSlide from 'landing/ActionSlide'
import GoodbyeSlide from 'landing/GoodbyeSlide'

class SlideController extends Component {
  static propTypes = {
    onSlideChange: PropTypes.func.isRequired
  };

  constructor (props) {
    super(props)

    this.state = {
      activeSlideIdx: 0,
      slides: ['action', 'goodbye']
    }
  }

  render () {
    const { slides, activeSlideIdx: i } = this.state
    const { winDem } = this.props

    return (
      <div
        className='get-started'
        style={{
          width: winDem.width * this.state.slides.length,
          transform: `translate3d(${i * -(100 / slides.length)}%, 0, 0)`
        }}
      >
        <ActionSlide
          key='slide-action'
          goToSlide={this.changeSlide.bind(this, 1)}
          style={{
            width: winDem.width
          }}
          slideIdx={0}
        />
        <GoodbyeSlide
          key='goodbye'
          style={{
            width: winDem.width
          }}
          openLoginModal={this.openLoginModal}
          slideIdx={1}
        />
      </div>
    )
  }

  changeSlide (i) {
    const newSlideIdx = i
    this.setState({
      activeSlideIdx: newSlideIdx > this.state.slides.length - 1
        ? this.state.slides.length - 1
        : newSlideIdx
    })
    this.props.onSlideChange({ index: i, name: this.state.slides[i] })
  }

  openLoginModal = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'modal/SHOW',
      payload: {
        modal: 'login',
        data: { nextState: window.location.pathname, hideUsername: true }
      }
    })
  };
}

export default connect(null)(SlideController)
