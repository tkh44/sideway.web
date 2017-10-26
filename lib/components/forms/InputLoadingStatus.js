import { Component, PropTypes } from 'react'
import IconLoadingField from 'art/IconLoadingField'

class InputLoadingStatus extends Component {
  static propTypes = {
    loading: PropTypes.bool
  };

  render () {
    const { loading } = this.props

    if (!loading) {
      return null
    }

    return (
      <div className='field-status loading'>
        <IconLoadingField />
      </div>
    )
  }
}

export default InputLoadingStatus
