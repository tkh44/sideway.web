import { expect } from 'code'
import Lab from 'lab'
import { queryString, decodeQueryString, compareString } from 'utils/string'

const lab = exports.lab = Lab.script()
const { describe, it } = lab

describe('String utils', () => {
  describe('queryString (encode)', () => {
    it('undefined argument', (done) => {
      expect(queryString()).to.equal('')
      done()
    })

    it('should return empty string on empty obj', (done) => {
      const result = queryString({})
      const expected = ''

      expect(result).to.equal(expected)
      done()
    })

    it('should handle one key', (done) => {
      const result = queryString({ foo: 'bar' })
      const expected = 'foo=bar'

      expect(result).to.equal(expected)
      done()
    })

    it('should handle multiple keys', (done) => {
      const result = queryString({ foo: 'bar', state: '/' })
      const expected = 'foo=bar&state=%2F'

      expect(result).to.equal(expected)
      done()
    })
  })

  describe('decodeQueryString (decode)', () => {
    it('should return empty string on empty obj', (done) => {
      const result = decodeQueryString('')
      const expected = {}

      expect(result).to.equal(expected)
      done()
    })

    it('should handle one key', (done) => {
      const result = decodeQueryString('foo=bar')
      const expected = { foo: 'bar' }

      expect(result).to.equal(expected)
      done()
    })

    it('should handle multiple keys', (done) => {
      const result = decodeQueryString('foo=bar&state=%2F')
      const expected = { foo: 'bar', state: '/' }

      expect(result).to.equal(expected)
      done()
    })
  })

  describe('compareString', () => {
    it('handles empty args', (done) => {
      expect(compareString()).to.equal(0)
      done()
    })

    it('compares', (done) => {
      expect(compareString('a', 'abc')).to.equal(1)
      expect(compareString('abc', 'abcd')).to.equal(3)
      expect(compareString('abc', 'abcd', 2)).to.equal(2)
      expect(compareString('cd', 'abcd')).to.equal(0)
      expect(compareString('12345', '12345', 5)).to.equal(5)
      done()
    })
  })
})
