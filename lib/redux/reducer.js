import { combineReducers } from 'redux'
import app from './app'
import auth from './auth'
import embed from './embed'
import insights from './insights'
import modalReducer from './modal'
import pageReducer from './pages'
import pushReducer from './push'
import registerReducer from './register'
import roomNotify from './room-notify'
import rooms from './rooms'
import roomUI from './room-ui'
import social from './social'
import sitrep from './sitrep'
import { nesReducer } from 'redux/nes'
import profile from './profile'

const rootReducer = combineReducers({
  app,
  auth,
  embed,
  insights,
  modal: modalReducer,
  nes: nesReducer,
  pages: pageReducer,
  profile,
  push: pushReducer,
  register: registerReducer,
  roomNotify,
  rooms,
  roomUI,
  sitrep,
  social
})

export default rootReducer
