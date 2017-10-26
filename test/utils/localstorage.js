import { expect } from 'code'
import Lab from 'lab'
import ls from 'utils/localstorage'

const lab = exports.lab = Lab.script()
const { describe, it } = lab

describe('localstorage', () => {
  it('CRUD', (done) => {
    ls.setItem('a', 'a')
    expect(ls.getItem('a')).to.equal('a')
    ls.removeItem('a')
    expect(ls.getItem('a')).to.not.exist()
    ls.setItem('b', 'b')
    ls.clear()
    expect(ls.getItem('b')).to.not.exist()

    ls.setItem('c', null)
    expect(ls.getItem('c')).to.not.exist()

    ls.setItem('d', undefined)
    expect(ls.getItem('d')).to.equal({})
    done()
  })
})
