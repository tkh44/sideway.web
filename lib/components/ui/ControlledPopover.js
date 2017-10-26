import { Component } from 'react'
import ReactDOM from 'react-dom'
import { omit } from 'lodash'
import listen from 'simple-listen'
import BasicTooltip from 'ui/BasicTooltip'

export default class ControlledPopover extends Component {
  static defaultProps = {
    alignAtFirstChild: false,
    alignPopover: 'center',
    animate: true,
    arrowSize: 8,
    component: 'div',
    edgeBuffer: 8,
    open: false,
    popoverComponent: BasicTooltip,
    popoverProps: {},
    resizeOnPopoverPropsChange: [],
    topBuffer: 64
  };

  state = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    height: 0,
    width: 0,
    tipLeft: 0,
    tipHeight: 0,
    tipWidth: 0
  };

  prevTop = null;
  prevLeft = null;
  prevArrowLeft = null;
  prevDirection = null;
  setNextStateAnimationId = null;
  resizeListener = null;

  componentDidMount () {
    if (this.props.open) {
      window.requestAnimationFrame(() => {
        this.setState(this.measure())
      })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.open === false && this.props.open === true) {
      this.setState(this.measure())
      this.resizeListener = listen(window, 'resize', this.handleResize)
    } else if (this.props.resizeOnPopoverPropsChange.length) {
      if (
        !this.props.resizeOnPopoverPropsChange.every(
          p => this.props.popoverProps[p] === prevProps.popoverProps[p]
        )
      ) {
        this.setState(this.measure())
      }
    }

    if (
      prevProps.open === true &&
      this.props.open === false &&
      this.resizeListener
    ) {
      this.resizeListener()
      this.resizeListener = null
    }
  }

  componentWillUnmount () {
    this.resizeListener && this.resizeListener()
    window.cancelAnimationFrame(this.setNextStateAnimationId)
  }

  render () {
    const {
      animate,
      className,
      style,
      children,
      component,
      popoverComponent,
      popoverProps,
      open,
      ...passable
    } = this.props

    const { arrowLeft, direction, ...popoverStyle } = this.getStyle()

    return React.createElement(
      component,
      {
        ...omit(passable, Object.keys(this.constructor.defaultProps)),
        ref: el => {
          this.wrapper = el
        },
        className,
        style: {
          position: 'relative',
          ...style
        }
      },
      children,
      open &&
        React.createElement(popoverComponent, {
          ref: el => {
            this.tip = el
          },
          ...popoverProps,
          style: {
            ...popoverProps.style,
            ...popoverStyle
          },
          animate,
          arrowLeft,
          direction
        })
    )
  }

  handleResize = () => {
    if (this.setNextStateAnimationId) {
      window.cancelAnimationFrame(this.setNextStateAnimationId)
    }

    this.setNextStateAnimationId = window.requestAnimationFrame(() => {
      this.setNextStateAnimationId = null
      this.setState(this.measure())
    })
  };

  measure () {
    const { alignAtFirstChild } = this.props
    const wrapperEl = ReactDOM.findDOMNode(this.wrapper)
    let rect

    if (alignAtFirstChild) {
      rect = wrapperEl.childNodes[0].getBoundingClientRect()
    } else {
      rect = wrapperEl.getBoundingClientRect()
    }

    const tipRect = this.tip
      ? ReactDOM.findDOMNode(this.tip).getBoundingClientRect()
      : { left: 0, width: 0, height: 0 }

    return {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      height: rect.height,
      width: rect.width,
      bodyWidth: document.body.clientWidth,
      tipLeft: tipRect.left,
      tipWidth: tipRect.width,
      tipHeight: tipRect.height
    }
  }

  getStyle = () => {
    const {
      alignPopover,
      arrowSize,
      edgeBuffer,
      open,
      topBuffer
    } = this.props

    if (!open) {
      return {
        top: this.prevTop || 0,
        left: this.prevLeft || 0,
        opacity: 0,
        arrowLeft: this.prevArrowLeft || 0,
        direction: this.prevDirection || 'top'
      }
    }

    const {
      height: parentHeight,
      top: parentTop,
      left: parentLeft,
      right: parentRight,
      width: parentWidth,
      bodyWidth,
      tipWidth,
      tipHeight
    } = this.state

    const halfParentWidth = parentWidth / 2
    let direction = 'top'
    let topPos = 0 - tipHeight - arrowSize
    let leftPos
    let arrowLeft

    switch (alignPopover) {
      case 'right':
        leftPos = parentWidth - tipWidth
        arrowLeft = 0.75 * tipWidth
        break

      case 'center':
      default:
        leftPos = halfParentWidth - tipWidth / 2
        arrowLeft = 0.5 * tipWidth
        break
    }

    // Too far left
    if (parentLeft + leftPos < edgeBuffer) {
      leftPos = 0 - (parentLeft - edgeBuffer)
      arrowLeft = halfParentWidth - leftPos
    }

    // Check if too far right
    const rightPos = leftPos + tipWidth
    const rightEdge = bodyWidth - edgeBuffer

    if (parentLeft + rightPos > rightEdge) {
      const distancePastRightEdge = parentRight + rightPos - rightEdge
      leftPos = leftPos + parentWidth - distancePastRightEdge
      arrowLeft = halfParentWidth - leftPos
    }

    // Check if too far up
    if (parentTop + topPos < topBuffer) {
      topPos = parentHeight + arrowSize
      direction = 'bottom'
    }

    this.prevTop = topPos
    this.prevLeft = leftPos
    this.prevArrowLeft = arrowLeft
    this.prevDirection = direction

    return {
      top: topPos,
      left: leftPos,
      opacity: 1,
      arrowLeft,
      direction
    }
  };
}
