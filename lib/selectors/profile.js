import { authInProgress, isLoggedIn } from 'selectors/auth'

export const profileFilter = state => state.profile

export const canCreateRoom = profile =>
  profile.scope.some(perm => perm === 'room:create')

export const loginInProgress = state => {
  const { profile } = state
  const { $$meta } = profile

  return authInProgress(state) || $$meta.fetching === true
}

export const loggedIn = state => {
  const { profile } = state
  const { $$meta } = profile

  return isLoggedIn(state) &&
    $$meta.fetching === false &&
    $$meta.status === 200
}
