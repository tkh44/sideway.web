import { get } from 'lodash'
import { getTicketStatus } from 'utils/hawk'

export const hasAppTicket = state => {
  return getTicketStatus(state.auth.app).valid
}

export const isLoggedIn = state => {
  return !!state.auth.user && state.profile.id
}

export const authInProgress = state => {
  return state.auth.inProgress || get(state.profile, '$$meta.fetching')
}
