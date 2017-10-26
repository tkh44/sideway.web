// @flow weak
import { get } from 'lodash'
import { mapStateDataToArray } from 'redux/nes'

export const pickPagesFromList = (ids = [], pages = {}) => {
  return mapStateDataToArray(
    Object.keys(pages).reduce(
      (accum, key) => {
        if (ids.indexOf(key) > -1) {
          accum[key] = pages[key]
        }
        return accum
      },
      {}
    )
  )
}

export const sortPageRoomsByPriority = (rooms = {}) => {
  return Object.keys(rooms).sort(
    (a, b) => rooms[a].priority - rooms[b].priority
  )
}

export const groupPageRoomsBySection = (page = {}) => {
  const sortedRoomIds = sortPageRoomsByPriority(page.rooms)
  return sortedRoomIds.reduce(
    (accum, id) => {
      const section = get(page, `rooms.${id}.section`, '')
      accum[section] = accum[section] || []
      accum[section].push(id)
      return accum
    },
    {}
  )
}
