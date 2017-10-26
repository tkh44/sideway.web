import { expect } from 'code'
import Lab from 'lab'
import { parseLinksFromText } from 'utils/parse-links'

const lab = exports.lab = Lab.script()
const { describe, it } = lab

describe('parse link util', () => {
  it('empty args', (done) => {
    expect(parseLinksFromText()).to.equal([
      {
        type: 'text',
        text: ''
      }
    ])
    done()
  })

  it('no urls', (done) => {
    expect(parseLinksFromText({ text: '123456789 123456789 ', links: [] })).to.equal([
      {
        type: 'text',
        text: '123456789 123456789 '
      }
    ])

    done()
  })

  it('basic url', (done) => {
    expect(parseLinksFromText({ text: 'sdwy.co', links: ['sdwy.co'] })).to.equal([
      {
        type: 'url',
        text: 'sdwy.co'
      }
    ])

    done()
  })

  it('url with text before', (done) => {
    expect(parseLinksFromText({ text: '012345678 www.sideway.com', links: ['www.sideway.com'] })).to.equal([
      {
        type: 'text',
        text: '012345678 '
      },
      {
        type: 'url',
        text: 'www.sideway.com'
      }
    ])

    done()
  })

  it('url with text after', (done) => {
    expect(parseLinksFromText({ text: 'www.sideway.com 123456789', links: ['www.sideway.com'] })).to.equal([
      {
        type: 'url',
        text: 'www.sideway.com'
      },
      {
        type: 'text',
        text: ' 123456789'
      }
    ])
    done()
  })

  it('url with text before and after', (done) => {
    expect(parseLinksFromText({ text: '012345678 www.sideway.com 123456789', links: ['www.sideway.com'] })).to.equal([
      {
        type: 'text',
        text: '012345678 '
      },
      {
        type: 'url',
        text: 'www.sideway.com'
      },
      {
        type: 'text',
        text: ' 123456789'
      }
    ])
    done()
  })

  it('handle mutliple duplicate urls', (done) => {
    expect(parseLinksFromText({ text: '012345678 www.sideway.com 12345678 www.sideway.com', links: ['www.sideway.com'] })).to.equal([
      {
        type: 'text',
        text: '012345678 '
      },
      {
        type: 'url',
        text: 'www.sideway.com'
      },
      {
        type: 'text',
        text: ' 12345678 '
      },
      {
        type: 'url',
        text: 'www.sideway.com'
      }
    ])

    done()
  })

  it('handle mutliple different urls', (done) => {
    expect(parseLinksFromText({
      text: '012345678 www.sideway.com 12345678 www.google.com',
      links: ['www.sideway.com', 'www.google.com']
    })).to.equal([
      {
        type: 'text',
        text: '012345678 '
      },
      {
        type: 'url',
        text: 'www.sideway.com'
      },
      {
        type: 'text',
        text: ' 12345678 '
      },
      {
        type: 'url',
        text: 'www.google.com'
      }
    ])

    done()
  })

  it('handle parens around urls', (done) => {
    expect(parseLinksFromText({ text: '012345678 (www.sideway.com) 12345678 www.sideway.com', links: ['www.sideway.com'] })).to.equal([
      {
        type: 'text',
        text: '012345678 ('
      },
      {
        type: 'url',
        text: 'www.sideway.com'
      },
      {
        type: 'text',
        text: ') 12345678 '
      },
      {
        type: 'url',
        text: 'www.sideway.com'
      }
    ])
    done()
  })

  it('only hashtag', (done) => {
    expect(parseLinksFromText({ text: '#awesome', links: [] }, { hashtag: true })).to.equal([
      {
        type: 'hashtag',
        text: '#awesome'
      }
    ])

    done()
  })

  it('text before hashtag', (done) => {
    expect(parseLinksFromText({ text: 'this is #awesome', links: [] }, { hashtag: true })).to.equal([
      {
        type: 'text',
        text: 'this is '
      },
      {
        type: 'hashtag',
        text: '#awesome'
      }
    ])

    done()
  })

  it('text after hashtag', (done) => {
    expect(parseLinksFromText({ text: '#awesome is the word', links: [] }, { hashtag: true })).to.equal([
      {
        type: 'hashtag',
        text: '#awesome'
      },
      {
        type: 'text',
        text: ' is the word'
      }
    ])

    done()
  })

  it('only mention', (done) => {
    expect(parseLinksFromText({ text: '@test', links: [] }, { mention: true })).to.equal([
      {
        type: 'mention',
        text: '@test'
      }
    ])

    done()
  })

  it('text before mention', (done) => {
    expect(parseLinksFromText({ text: 'this is @test', links: [] }, { mention: true })).to.equal([
      {
        type: 'text',
        text: 'this is '
      },
      {
        type: 'mention',
        text: '@test'
      }
    ])

    done()
  })

  it('text after mention', (done) => {
    expect(parseLinksFromText({ text: '@test is the person', links: [] }, { mention: true })).to.equal([
      {
        type: 'mention',
        text: '@test'
      },
      {
        type: 'text',
        text: ' is the person'
      }
    ])

    done()
  })

  it('url, mention, and hashtag', (done) => {
    expect(parseLinksFromText({ text: '@test is the person to #doit www.google.com', links: ['www.google.com'] }, {
      mention: true,
      hashtag: true
    })).to.equal([
      {
        type: 'mention',
        text: '@test'
      },
      {
        type: 'text',
        text: ' is the person to '
      },
      {
        type: 'hashtag',
        text: '#doit'
      },
      {
        type: 'text',
        text: ' '
      },
      {
        type: 'url',
        text: 'www.google.com'
      }
    ])

    done()
  })

  it('missing link', (done) => {
    expect(parseLinksFromText({ text: 'This is a test when there is no actual link in the text', links: ['www.google.com'] })).to.equal([
      {
        type: 'text',
        text: 'This is a test when there is no actual link in the text'
      }
    ])

    done()
  })
})
