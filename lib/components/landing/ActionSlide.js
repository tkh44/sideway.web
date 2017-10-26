export const ActionSlide = props => {
  return (
    <div className='slide action' style={props.style}>
      <div
        className='action-text-button action-text-wrapper cursor-pointer'
        onClick={props.goToSlide}
      >
        share a conversation
        {' '}
        <span className='lightgreen arrow-button'>
          &gt;
        </span>
      </div>
    </div>
  )
}

export default ActionSlide
