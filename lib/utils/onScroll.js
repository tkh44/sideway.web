/**
 * Adapted from react-virtualized
 * https://github.com/bvaughn/react-virtualized/blob/06b0322f5d01407e3e5e3120634c1306c518f915/source/WindowScroller/utils/onScroll.js
 *
 * MIT license https://github.com/bvaughn/react-virtualized/blob/06b0322f5d01407e3e5e3120634c1306c518f915/LICENSE
 */

let mountedInstances = []
let originalBodyPointerEvents = null
let disablePointerEventsTimeoutId = null

/**
 * Specifies the number of miliseconds during which to disable pointer events while a scroll is in progress.
 * This improves performance and makes scrolling smoother.
 */
export let IS_SCROLLING_TIMEOUT = 150

const enablePointerEventsIfDisabled = () => {
  if (disablePointerEventsTimeoutId) {
    disablePointerEventsTimeoutId = null

    document.body.style.pointerEvents = originalBodyPointerEvents

    originalBodyPointerEvents = null
  }
}

const enablePointerEventsAfterDelayCallback = () => {
  enablePointerEventsIfDisabled()
}

const enablePointerEventsAfterDelay = () => {
  if (disablePointerEventsTimeoutId) {
    clearTimeout(disablePointerEventsTimeoutId)
  }

  disablePointerEventsTimeoutId = setTimeout(
    enablePointerEventsAfterDelayCallback,
    IS_SCROLLING_TIMEOUT
  )
}

const onScrollWindow = event => {
  if (originalBodyPointerEvents == null) {
    originalBodyPointerEvents = document.body.style.pointerEvents

    document.body.style.pointerEvents = 'none'

    enablePointerEventsAfterDelay()
  }
  mountedInstances.forEach(function ({ handler }) {
    return handler(event)
  })
}

export const registerScrollListener = (component, handler) => {
  if (!mountedInstances.length) {
    window.addEventListener('scroll', onScrollWindow)
  }
  mountedInstances.push({ component, handler })
}

export const unregisterScrollListener = component => {
  mountedInstances = mountedInstances.filter(c => c.component !== component)
  if (!mountedInstances.length) {
    window.removeEventListener('scroll', onScrollWindow)
    if (disablePointerEventsTimeoutId) {
      clearTimeout(disablePointerEventsTimeoutId)
      enablePointerEventsIfDisabled()
    }
  }
}
