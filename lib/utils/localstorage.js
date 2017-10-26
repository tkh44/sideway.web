const ls = {
  // Save an item to localStorage

  setItem (key, value) {
    return window.localStorage.setItem(key, JSON.stringify(value))
  },

  // Retrieve an item from localStorage

  getItem (key) {
    let result

    try {
      result = JSON.parse(window.localStorage.getItem(key))
    } catch (e) {
      result = {}
    }

    return result
  },

  // Remove one item from localStorage

  removeItem (key) {
    return window.localStorage.removeItem(key)
  },

  // Remove all items from localStorage

  clear () {
    window.localStorage.clear()
  }
}

export default ls
