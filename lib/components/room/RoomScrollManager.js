import { Component, DOM } from 'react'
import * as domUtils from 'utils/dom'

class RoomScrollManager extends Component {
  componentDidMount () {
    domUtils.scrollToBottom()
  }

  render () {
    return DOM.noscript()
  }
}

export default RoomScrollManager
