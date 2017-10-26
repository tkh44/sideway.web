const COPY = "Create quick chat rooms for quality, focused conversations. Invite an audience to watch in real time and when you're done, the exchange lives on."

export const GoodbyeSlide = props => {
  return (
    <div className='slide goodbye' style={props.style}>
      <div className='goodbye-message'>
        {COPY}
        <div
          className='action-text-wrapper cursor-pointer'
          onClick={props.openLoginModal}
        >
          Get started
          {' '}
          <span className='lightgreen arrow-button'>
            &gt;
          </span>
        </div>
      </div>
    </div>
  )
}

export default GoodbyeSlide
