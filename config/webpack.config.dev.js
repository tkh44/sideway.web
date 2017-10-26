const Webpack = require('webpack')
const BaseConfig = require('./webpack.config.base')

module.exports = function (options) {
  const baseConfig = BaseConfig(options)
  const hotLoaderUrl = 'webpack-hot-middleware/client'
  return Object.assign({}, baseConfig, {
    devtool: 'cheap-source-map', // 'source-map',
    entry: Object.assign({}, baseConfig.entry, {
      app: [hotLoaderUrl].concat(baseConfig.entry.app)
    }),
    plugins: [new Webpack.HotModuleReplacementPlugin()].concat(
      baseConfig.plugins
    )
  })
}
