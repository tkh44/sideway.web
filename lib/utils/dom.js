import getDocumentScrollElement from 'fbjs/lib/getDocumentScrollElement'
import getScrollPosition from 'fbjs/lib/getScrollPosition'
import Scroll from 'fbjs/lib/Scroll'

export const ua = window.navigator.userAgent.toLowerCase()
export const isIOS = !!ua.match(/ipad|iphone|ipod/)

export const isElementInViewport = el => {
  const rect = el.getBoundingClientRect()

  return rect.top >= -200 &&
    rect.left >= -200 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) + 500 &&
    rect.right <=
      (window.innerWidth || document.documentElement.clientWidth) + 500
}

// In IE10+ scrollY is undefined, so we replace that with the latter
export const getScrollPos = () => {
  const { y } = getScrollPosition(getDocumentScrollElement(document))
  return y
}

export const isScrolledToBottom = (buffer = 0) => {
  const doc = getDocumentScrollElement(document)
  return window.innerHeight + getScrollPos() + buffer >= doc.scrollHeight
}

export const scrollToPos = pos => {
  Scroll.setTop(document.body, pos)
}

let scrollAnimId
export const scrollToBottom = () => {
  if (scrollAnimId) {
    return
  }

  scrollAnimId = window.requestAnimationFrame(() => {
    const doc = getDocumentScrollElement(document)
    Scroll.setTop(doc, doc.scrollHeight)
    scrollAnimId = null
  })
}
