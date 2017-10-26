import { Children, cloneElement, createFactory } from 'react'
import { connect } from 'react-redux'
import cn from 'classnames'
import SimpleMarkdown from 'simple-markdown'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, commonStyles, font } from 'style'
import { extend } from 'lodash'
import compose from 'recompose/compose'
import defaultProps from 'recompose/defaultProps'
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys'
import { parseLinksFromText } from 'utils/parse-links'
import RedirectLink from 'ui/RedirectLink'
import Embed from 'ui/Embed'

const TYPE_SYMBOL = (typeof Symbol === 'function' &&
  Symbol.for &&
  Symbol.for('react.element')) ||
  0xeac7

const RedirectLinkFactory = createFactory(RedirectLink)

const rules = extend({}, SimpleMarkdown.defaultRules, {
  heading: extend({}, SimpleMarkdown.defaultRules.heading, {
    react: (node, output, state) => {
      const props = {
        children: output(node.content, state)
      }

      return {
        type: 'heading',
        key: state.key,
        props,
        $$typeof: TYPE_SYMBOL,
        _store: {
          validated: true,
          originalProps: props
        }
      }
    }
  }),
  link: extend({}, SimpleMarkdown.defaultRules.link, {
    react: (node, output, state) => {
      const props = {
        children: output(node.content, state),
        className: css(styles.link),
        initialUrl: node.target,
        key: state.key,
        title: node.title
      }

      return RedirectLinkFactory(props)
    }
  }),
  table: extend({}, SimpleMarkdown.defaultRules.table, {
    match: () => null
  }),
  url: extend({}, SimpleMarkdown.defaultRules.url, {
    match: () => null
  })
})
const rawBuiltParser = SimpleMarkdown.parserFor(rules)

const parse = source => {
  const blockSource = source.replace(/\n*$/, '') + '\n\n'
  return rawBuiltParser(blockSource)
}

const reactOutput = SimpleMarkdown.reactFor(
  SimpleMarkdown.ruleOutput(rules, 'react')
)

const generateDOMfromText = (
  messagePartText,
  links = [],
  highlighted = false,
  displayNodesAsBlocks = false,
  removeLinkOnlyText = false,
  hideEmbedOnlyBorder = false
) => {
  const syntaxTree = parse(messagePartText)
  const mdChildren = reactOutput(syntaxTree)
  const embeds = []

  const extractLinksInText = (parsedTextParts, parentType) => {
    return parsedTextParts.map((parsed, i) => {
      const { type, text } = parsed

      if (type === 'text') {
        return (
          <span
            style={{
              backgroundColor: highlighted ? colors.faintgbrandgreen : ''
            }}
          >
            {text}
          </span>
        )
      }

      const onlyEmbed = parentType !== 'heading' &&
        parsedTextParts.length === 1
      if (!embeds.some(embed => embed.props.contextUrl === text)) {
        embeds.push(
          <Embed
            key={'embed--' + text}
            inline
            contextUrl={text}
            showLinkOnFail={false}
            hideBorder={hideEmbedOnlyBorder && onlyEmbed}
            offsets={200}
          >
            <RedirectLink initialUrl={text} className={css(styles.link)}>
              {text}
            </RedirectLink>
          </Embed>
        )
      }

      if (removeLinkOnlyText && onlyEmbed) {
        return
      }

      const link = (
        <RedirectLink
          initialUrl={text}
          className={css(
            styles.link,
            parentType === 'heading' && styles.headingLink
          )}
        >
          {text}
        </RedirectLink>
      )

      return link
    })
  }

  const getChildren = leaf => leaf.props && leaf.props.children

  const getChildType = child =>
    typeof child.type === 'string' ? child.type || 'text' : 'custom'

  const parseTree = (mdChild, parentType, index) => {
    if (typeof mdChild === 'string') {
      mdChild = extractLinksInText(
        parseLinksFromText({ text: mdChild, links }),
        parentType
      )
      return mdChild
    }

    const currentChildren = getChildren(mdChild)
    const type = getChildType(mdChild)
    const className = css(
      styles[type],
      mdChild.type === RedirectLink && styles.link,
      displayNodesAsBlocks &&
        type !== 'li' &&
        mdChild.props.className === 'paragraph' &&
        styles.displayBlock
    )

    if (type === 'ul' || type === 'ol') {
      return (
        <div className={css(styles.listWrapper)}>
          {cloneElement(mdChild, {
            key: index,
            children: currentChildren
              ? Children.map(currentChildren, child => parseTree(child, type))
              : null,
            className
          })}
        </div>
      )
    }

    return cloneElement(mdChild, {
      key: index,
      children: currentChildren
        ? Children.map(currentChildren, child => parseTree(child, type))
        : null,
      className
    })
  }

  return {
    children: Children.map(mdChildren, (child, i) => parseTree(child, null, i)),
    embeds: embeds
  }
}

const TextRenderer = onlyUpdateForKeys([
  'children',
  'text',
  'links',
  'hideEmbedOnlyBorder',
  'displayNodesAsBlocks',
  'removeLinkOnlyText',
  'highlighted',
  'highlightColor'
])(({
  children,
  className,
  links,
  text,
  hideEmbedOnlyBorder,
  highlighted,
  highlightColor,
  displayNodesAsBlocks,
  removeLinkOnlyText,
  onClick
}) => {
  const {
    children: generatedChildren,
    embeds: embedChildren
  } = generateDOMfromText(
    text,
    links,
    highlighted,
    displayNodesAsBlocks,
    removeLinkOnlyText,
    hideEmbedOnlyBorder
  )

  return (
    <div
      className={cn(className, css(styles.generatedChildren))}
      onClick={onClick}
    >
      {generatedChildren}
      {children}
      {embedChildren}
    </div>
  )
})

const mapStateToProps = state => ({ embed: state.embed })

export default compose(
  defaultProps({
    text: '',
    links: [],
    hideEmbedOnlyBorder: false,
    displayNodesAsBlocks: false,
    removeLinkOnlyText: false,
    highlighted: false,
    highlightColor: colors.faintgbrandgreen
  }),
  connect(mapStateToProps)
)(function FormattedText (props) {

  const embedableLinks = props.links.filter(link => {
    const embedInfo = props.embed[link]
    const imageOnly = embedInfo &&
      embedInfo.summary &&
      embedInfo.summary.image &&
      !embedInfo.summary.description &&
      embedInfo.summary.image === embedInfo.summary.title
    return !embedInfo || embedInfo.embed !== false || imageOnly
  })

  return <TextRenderer {...props} links={embedableLinks} />
})

const styles = StyleSheet.create({
  generatedChildren: {
    display: 'inline'
  },
  link: {
    ...commonStyles.fancyLink
  },
  text: {
    display: 'inline',
    wordWrap: 'break-word',
    hyphens: 'auto'
  },
  div: {
    display: 'inline',
    wordWrap: 'break-word',
    hyphens: 'auto'
  },
  displayBlock: {
    display: 'block',
    marginTop: 8
  },
  listWrapper: {
    display: 'block',
    paddingLeft: 24,
    overflow: 'hidden'
  },
  li: {
    marginBottom: 4
  },
  pre: {
    fontFamily: font.monoSpaceFamily,
    background: '#f7f7f9',
    borderRadius: 2,
    padding: 1,
    color: colors.midgreen
  },
  heading: {
    ...font.headline,
    fontWeight: 'bold',
    marginBottom: 4
  },
  headingLink: {
    ...commonStyles.fancyLink
  },
  code: {
    display: 'inline',
    fontFamily: font.monoSpaceFamily,
    fontSize: '90%',
    background: '#f7f7f9',
    borderRadius: 2,
    padding: 1,
    border: '1px solid #E1E1E8',
    color: colors.midgreen
  },
  hr: {
    display: 'block',
    height: 4,
    marginTop: 16,
    marginRight: 0,
    marginBottom: 16,
    marginLeft: 0,
    backgroundColor: colors.faintgray,
    border: 'none',
    borderRadius: 2
  }
})
