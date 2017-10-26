const regExEscape = /[-/\\^$*+?.()|[\]{}]/g

const createParser = (label, regex) =>
  parts => {
    return parts
      .reduce(
        (accum, part, i) => {
          if (
            part.type === 'url' ||
            part.type === 'hashtag' ||
            part.type === 'mention'
          ) {
            accum.push(part)
            return accum
          }

          const re = regex
          let wasFound = false
          let lastEnd = 0
          let match
          while ((match = re.exec(part.text)) !== null) {
            wasFound = true
            if (
              (lastEnd === 0 && match.index !== 0) ||
              match.index !== lastEnd + 1
            ) {
              accum.push({
                type: 'text',
                text: part.text.substring(lastEnd, match.index)
              })
            }
            lastEnd = re.lastIndex
            accum.push({
              type: label,
              text: part.text.substring(match.index, re.lastIndex)
            })
          }

          if (wasFound === false) {
            accum.push(part)
            return accum
          }

          if (accum[accum.length - 1]) {
            accum.push({
              type: 'text',
              text: part.text.split(accum[accum.length - 1].text)[1]
            })
          }
          return accum
        },
        []
      )
      .filter(part => part.text && part.text.length)
  }

const findHashtags = createParser('hashtag', /\B#\w*[a-zA-Z]+\w*/g)
const findMentions = createParser(
  'mention',
  /\B[@＠][a-zA-Z][a-zA-Z0-9_-]{0,24}/gi
)

export const parseLinksFromText = (
  {
    text = '',
    links = []
  } = {},
  options = {
    hashtag: false,
    mention: false
  }
) => {
  if (!links || links.length === 0) {
    let result = [{ type: 'text', text }]
    if (options.mention) {
      result = findMentions(result)
    }
    if (options.hashtag) {
      result = findHashtags(result)
    }
    return result
  }

  const found = links
    .reduce(
      (accum, url) => {
        const re = new RegExp(url.replace(regExEscape, '\\$&'), 'ig')
        let match

        while ((match = re.exec(text)) !== null) {
          accum.push([match.index, re.lastIndex])
        }

        return accum
      },
      []
    )
    .sort((a, b) => a[0] - b[0]) // sort links by start position

  if (found.length === 0) {
    let result = [{ type: 'text', text }]
    if (options.mention) {
      result = findMentions(result)
    }
    if (options.hashtag) {
      result = findHashtags(result)
    }
    return result
  }

  const parsedWithLinks = found.length === 0
    ? [{ type: 'text', text }]
    : found.reduce(
        (accum, pos, i) => {
          const isLast = i === found.length - 1
          const previous = accum[accum.length - 1]

          if (!previous && pos[0] !== 0) {
            // add the text before first link
            accum.push({ type: 'text', text: text.substring(0, pos[0]) })
          }

          if (previous && pos[0] !== found[i - 1][1] - 1) {
            // add the text between the links
            accum.push({
              type: 'text',
              text: text.substring(found[i - 1][1], pos[0])
            })
          }

          // accum.push(pos)
          accum.push({ type: 'url', text: text.substring(pos[0], pos[1]) })

          if (isLast && pos[1] !== text.length) {
            accum.push({ type: 'text', text: text.substring(pos[1]) })
          }

          return accum
        },
        []
      )

  let result = parsedWithLinks
  if (options.mention) {
    result = findMentions(result)
  }
  if (options.hashtag) {
    result = findHashtags(result)
  }

  return result
}
