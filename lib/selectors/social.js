import { find } from 'lodash'

export const getSocialUserByUsername = (state, username) => {
  return state.social[username]
}

export const getSocialUserById = (state, id) => {
  return find(state.social, value => value.id === id)
}
