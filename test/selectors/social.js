import { expect } from 'code'
import Lab from 'lab'
import {
    getSocialUserById
} from 'selectors/social'

const lab = exports.lab = Lab.script()
const { describe, it } = lab

describe('Social Selectors', () => {
  describe('getSocialUserById', () => {
    it('gets user by id', (done) => {
      const state = {}
      state.social = {
        'bob': {
          id: 'a1',
          username: 'bob'
        },
        'arrow': {
          id: 'b2',
          username: 'arrow'
        },
        'jane': {
          id: 'c3',
          username: 'jane'
        },
        'mandy': {
          id: 'd4',
          username: 'mandy'
        }
      }

      expect(getSocialUserById(state, 'b2').username).to.equal('arrow')
      expect(getSocialUserById(state, 'd4').username).to.equal('mandy')
      expect(getSocialUserById(state, 'zz')).to.be.undefined()
      done()
    })
  })
})
