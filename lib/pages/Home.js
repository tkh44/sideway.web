import authDoor from 'hoc/auth-door'
import asyncComponent from 'hoc/async-component'

export default authDoor(
  asyncComponent(() =>
    System.import('pages/Dashboard').then(module => module.default)),
  asyncComponent(() =>
    System.import('pages/Landing').then(module => module.default))
)()
