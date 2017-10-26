let TRANSITION_EVENT

const whichTransitionEvent = () => {
  if (TRANSITION_EVENT) {
    return TRANSITION_EVENT
  }

  const transitions = {
    transition: 'transitionend',
    OTransition: 'oTransitionEnd',
    MozTransition: 'transitionend',
    WebkitTransition: 'webkitTransitionEnd'
  }

  for (const t in transitions) {
    if (document.body.style[t] !== undefined) {
      return transitions[t]
    }
  }
}

export const transitionEventName = whichTransitionEvent()

export const delayAnimationFrame = (fn, delay) => {
  return setTimeout(() => window.requestAnimationFrame(fn), delay)
}
