const Fs = require('fs')
const _ = require('lodash')
const GitSemverTags = require('git-semver-tags')

const BuildHtmlPlugin = function (options) {
  Object.assign(this, options)
}

BuildHtmlPlugin.prototype.apply = function (compiler) {
  const templatePath = this.templatePath
  const publicPath = this.publicPath
  const sidewayConfig = this.sidewayConfig
  const development = this.development
  const staging = this.staging
  const production = this.production

  compiler.plugin('emit', (compilation, compileCallback) => {
    const stats = compilation.getStats().toJson()
    const template = Fs.readFileSync(templatePath, 'utf8')

    const server = ['api', 'login'].reduce(
      (accum, prefix) => {
        accum[prefix] = sidewayConfig.server.source.scheme +
          '://' +
          prefix +
          '.' +
          sidewayConfig.server.source.root
        return accum
      },
      {}
    )

    server.web = sidewayConfig.server.source.scheme +
      '://' +
      sidewayConfig.server.source.root
    server.short = sidewayConfig.server.source.scheme +
      '://' +
      sidewayConfig.server.source.short
    server.embed = sidewayConfig.server.source.scheme +
      '://' +
      sidewayConfig.server.source.embed

    const [jsFiles, cssFiles] = _(stats.chunks)
      .sortBy('entry')
      .reverse()
      .filter(a => a.initial)
      .reduce(
        ([js, css], chunk) => {
          const files = chunk.files.map(f => publicPath + f)
          js.push(files[0])

          return [
            js.concat(files[0]),
            css.concat(files.filter(f => /.css($|\?)/.test(f)))
          ]
        },
        [[], []]
      )

    const context = {
      server: publicPath,
      client: {
        server,
        hawk: { app: null }
      },
      jsFiles: _.uniq(jsFiles),
      hash: stats.hash,
      staging,
      production
    }

    if (development && staging) {
      context.client.hawk.app = {
        id: 'sideway.dev',
        key: 'public',
        algorithm: 'sha256'
      }
    } else if (!development && staging) {
      context.client.hawk.app = {
        id: 'sideway.stage',
        key: 'public',
        algorithm: 'sha256'
      }
    } else {
      context.client.hawk.app = {
        id: 'sideway.web',
        key: 'public',
        algorithm: 'sha256'
      }
    }

    if (development) {
      context.analytics = false
    } else {
      context.analytics = true
    }

    GitSemverTags((ignore, tag) => {
      context.version = tag[0]
      context.client.version = tag[0]

      const html = _.template(template)(context)
      const styleString = compilation.assets['styles.css']
        ? compilation.assets['styles.css'].children.reduce(
            (accum, child) => {
              accum += ' ' + child._value
              return accum
            },
            ''
          )
        : ''

      const injectedHtml = html.replace(
        '<style id="InjectedStyles"></style>',
        `<style id="InjectedStyles">${styleString}</style>`
      )
      compilation.assets['index.html'] = {
        source: () => {
          return injectedHtml
        },
        size: () => {
          return injectedHtml.length
        }
      }
      compileCallback()
    })
  })
}

module.exports = BuildHtmlPlugin
