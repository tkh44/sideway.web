/* eslint-env serviceworker */
// self.addEventListener('install', function (event) {
//   event.waitUntil(self.skipWaiting())
// })

function createTextNotification (eventData) {
  return {
    icon: '/favicon/android-chrome-192x192.png',
    tag: 'sideway-general-tag',
    title: 'Sideway Notification',
    body: eventData
  }
}

function createSubscribedNotification () {
  return {
    icon: '/favicon/android-chrome-192x192.png',
    tag: 'sideway-subscribe-tag',
    title: 'Sideway Notification',
    body: 'You have successfully enabled notifications.'
  }
}

function createRoomStartNotification ({ id, owner, title }) {
  return {
    icon: owner.avatar,
    tag: 'sideway-room-active-tag',
    title: 'Conversation Started',
    body: `"${title}" by ${owner.display} started.`
  }
}

self.addEventListener('push', function (event) {
  let title = 'Sideway Notification'
  let body = ''
  let icon
  let tag
  let data

  try {
    data = event.data.json()
  } catch (e) {
    try {
      data = event.data.text()
    } catch (e) {
      data = 'Sideway Notification'
    }
  }
  if (typeof data === 'string') {
    ({ icon, tag, title, body } = createTextNotification(data))
  } else if (data.event === 'subscribed') {
    ({ icon, tag, title, body } = createSubscribedNotification())
  } else if (data.event === 'room' && data.status === 'active') {
    ({ icon, tag, title, body } = createRoomStartNotification(data))
  }

  event.waitUntil(
    self.registration.showNotification(title, { body, icon, tag, data })
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const data = event.notification.data
  let appUrl = '/'

  if (data.event === 'room') {
    appUrl = `/room/${data.id}`
  }

  event.waitUntil(
    self.clients
      .matchAll({
        includeUncontrolled: true,
        type: 'window'
      })
      .then(activeClients => {
        if (activeClients.length > 0) {
          if (activeClients[0].url.indexOf(appUrl) === -1) {
            activeClients[0].navigate(appUrl)
          }
          activeClients[0].focus()
        } else {
          self.clients.openWindow(appUrl)
        }
      })
  )
})
