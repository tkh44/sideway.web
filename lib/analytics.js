/* global ga */
import 'autotrack'

ga('create', 'UA-66054611-1', 'auto')

ga('require', 'cleanUrlTracker', {
  indexFilename: 'index.html',
  trailingSlash: 'remove'
})
ga('require', 'eventTracker', {
  attributePrefix: 'data-ga-'
})
// ga('require', 'impressionTracker')
ga('require', 'maxScrollTracker')
ga('require', 'outboundLinkTracker')
ga('require', 'pageVisibilityTracker')
ga('require', 'urlChangeTracker')

ga('send', 'pageview')
