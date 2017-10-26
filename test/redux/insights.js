import { expect } from 'code'
import Lab from 'lab'
import { createEnv, expectResponse, createUser } from '../test-utils'
import reducer, { insightActions } from 'redux/insights'
import { getInsightById } from 'selectors/insights'

const lab = (exports.lab = Lab.script())
const { describe, it } = lab

describe('insights', () => {
  describe('State', () => {
    it(insightActions.getRoom.toString(), done => {
      const resPayload = {
        id: '1',
        sessions: { [Date.now()]: ['1', '2'] },
        referrers: {}
      }

      const action = {
        type: insightActions.getRoom.toString(),
        payload: {
          id: '1',
          statusCode: 200,
          payload: resPayload
        }
      }
      expect(reducer({}, action)).to.equal({
        '1': resPayload
      })
      done()
    })

    it(insightActions.subUpdate.toString(), done => {
      const subMessage = {
        id: '1',
        sessions: { [Date.now()]: ['1', '2'] },
        referrers: {}
      }

      const action = {
        type: insightActions.getRoom.toString(),
        payload: {
          id: '1',
          flags: {},
          payload: subMessage
        }
      }
      expect(reducer({}, action)).to.equal({
        '1': subMessage
      })
      done()
    })
  })
})
