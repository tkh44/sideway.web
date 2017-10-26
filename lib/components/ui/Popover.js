import { Component } from 'react'
import ReactDOM from 'react-dom'
import { get, omit } from 'lodash'
import listen from 'simple-listen'
import BasicTooltip from 'ui/BasicTooltip'

export default class Popover extends Component {
  static defaultProps = {
    alignAtFirstChild: false,
    alignPopover: 'center',
    animate: true,
    arrowSize: 4,
    closeOnInnerClick: false,
    component: 'div',
    edgeBuffer: 8,
    hoverDelay: 300,
    ignoreAttr: false,
    onClose: () => {},
    onOpen: () => {},
    openOnMount: false,
    openOnClick: false,
    popoverComponent: BasicTooltip,
    popoverProps: {},
    resizeOnPopoverPropsChange: [],
    preventPropagation: true,
    tooltip: '',
    topBuffer: 64
  };

  state = {
    open: false,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    height: 0,
    width: 0,
    tipLeft: 0,
    tipHeight: 0,
    tipWidth: 0,
    initialTipMeasurementTaken: false
  };

  documentListener = null;
  scrollListener = null;
  ignoreMouseOver = null;
  overTimeout = null;
  outTimeout = null;
  innerClickTimeout = null;
  prevTop = null;
  prevLeft = null;
  prevArrowLeft = null;
  prevDirection = null;
  setNextStateAnimationId = null;

  componentDidMount () {
    if (this.props.openOnMount) {
      this.measureAndOpen()
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.open === false && this.state.open === true) {
      this.attachEventListeners()
      this.measureTip()
    } else if (prevState.open === true && this.state.open === false) {
      this.detachEventListeners()
    } else if (this.props.resizeOnPopoverPropsChange.length) {
      if (
        this.state.open &&
        !this.props.resizeOnPopoverPropsChange.every(
          p => this.props.popoverProps[p] === prevProps.popoverProps[p]
        )
      ) {
        this.measureAndOpen()
      }
    }
  }

  componentWillUnmount () {
    if (this.state.open) {
      this.props.onClose()
    }
    clearTimeout(this.overTimeout)
    clearTimeout(this.outTimeout)
    clearTimeout(this.innerClickTimeout)
    window.cancelAnimationFrame(this.setNextStateAnimationId)
    this.detachEventListeners()
  }

  render () {
    const { open, initialTipMeasurementTaken } = this.state

    const {
      className,
      style,
      children,
      component,
      popoverComponent,
      popoverProps,
      openOnClick,
      ...passable
    } = this.props

    const { arrowLeft, direction, ...popoverStyle } = this.getStyle()

    const popoverFinalStyle = {
      ...popoverProps.style,
      ...popoverStyle
    }

    popoverFinalStyle.opacity = initialTipMeasurementTaken
      ? popoverFinalStyle.opacity
      : 0

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
        },
        onMouseEnter: this.handleMouseEnter,
        onMouseLeave: this.handleMouseLeave,
        onClick: this.handleClick,
        onTouchStart: this.handleTouchStart,
        onTouchEnd: this.handleTouchEnd
      },
      children,
      open &&
        React.createElement(popoverComponent, {
          key: 'rendered-popover',
          ref: el => {
            this.tip = el
          },
          openOnClick,
          ...popoverProps,
          style: popoverFinalStyle,
          arrowLeft,
          direction
        })
    )
  }

  handleClick = e => {
    if (e.target.tagName === 'A') {
      return
    }

    if (this.props.onClick) {
      this.props.onClick(e)
    }

    if (!this.props.openOnClick) {
      return
    }

    const tipEl = ReactDOM.findDOMNode(this.tip)
    if (tipEl && (e.target === tipEl || tipEl.contains(e.target))) {
      return
    }

    if (this.state.open) {
      this.closePopover()
    } else {
      this.measureAndOpen()
    }
  };

  handleDocumentClick = e => {
    if (!this.state.open) {
      return
    }

    if (this.props.closeOnInnerClick) {
      this.innerClickTimeout = setTimeout(this.closePopover, 16)
      return
    }

    const wrapperEl = ReactDOM.findDOMNode(this.wrapper)
    if (e.target === wrapperEl || wrapperEl.contains(e.target)) {
      return
    }

    const { ignoreAttr } = this.props

    if (ignoreAttr) {
      let node = e.target
      let hasIgnoreAttr = false

      while (node) {
        hasIgnoreAttr = get(node, ['attributes', ignoreAttr])
        if (hasIgnoreAttr) {
          return
        }
        node = node.parentNode
      }
    }

    this.closePopover()
  };

  handleMouseEnter = e => {
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(e)
    }

    if (this.props.openOnClick || this.ignoreMouseOver) {
      return
    }

    clearTimeout(this.outTimeout)
    this.outTimeout = null

    if (this.overTimeout) {
      return
    }

    this.overTimeout = setTimeout(
      () => {
        this.overTimeout = null
        this.measureAndOpen()
      },
      this.props.hoverDelay
    )
  };

  handleMouseLeave = e => {
    if (this.props.onMouseLeave) {
      this.props.onMouseLeave(e)
    }

    if (this.props.openOnClick) {
      return
    }

    clearTimeout(this.overTimeout)
    this.overTimeout = null

    if (this.outTimeout) {
      return
    }

    if (!this.state.open) {
      return
    }

    this.outTimeout = setTimeout(
      () => {
        this.outTimeout = null
        this.closePopover()
      },
      this.props.hoverDelay / 2
    )
  };

  handleTouchStart = e => {
    if (this.props.onTouchStart) {
      this.props.onTouchStart(e)
    }

    if (!this.props.openOnClick) {
      this.ignoreMouseOver = true
    }
  };

  handleTouchEnd = e => {
    if (this.props.onTouchEnd) {
      this.props.onTouchEnd(e)
    }

    this.ignoreMouseOver = false
  };

  handleResize = () => {
    if (this.setNextStateAnimationId) {
      window.cancelAnimationFrame(this.setNextStateAnimationId)
    }

    this.setNextStateAnimationId = window.requestAnimationFrame(() => {
      this.setNextStateAnimationId = null
      this.setState(this.measure())
    })
  };

  attachEventListeners () {
    if (this.props.openOnClick) {
      this.documentListener = listen(
        document,
        'click',
        this.handleDocumentClick,
        true
      )
    }

    this.resizeListener = listen(window, 'resize', this.handleResize)
  }

  detachEventListeners () {
    window.cancelAnimationFrame(this.setNextStateAnimationId)

    const listeners = [this.documentListener, this.resizeListener]
    listeners.forEach(listener => {
      if (listener && typeof listener === 'function') {
        listener()
      }
    })
  }

  measureAndOpen = () => {
    setTimeout(() => {
      this.setState({ open: true, ...this.measure() }, this.props.onOpen)
    })
  };

  closePopover = () => {
    if (this.state.open === false) {
      return
    }

    this.setState({ open: false }, this.props.onClose)
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

    return {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      height: rect.height,
      width: rect.width,
      bodyWidth: document.body.clientWidth
    }
  }

  measureTip () {
    setTimeout(() => {
      const tipRect = this.tip
        ? ReactDOM.findDOMNode(this.tip).getBoundingClientRect()
        : { left: 0, width: 0, height: 0 }

      return this.setState({
        tipLeft: tipRect.left,
        tipWidth: tipRect.width,
        tipHeight: tipRect.height,
        initialTipMeasurementTaken: true
      })
    })
  }

  getStyle = () => {
    const { open } = this.state
    const {
      alignPopover,
      arrowSize,
      edgeBuffer,
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
