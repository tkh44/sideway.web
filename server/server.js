const Path = require('path')
const Hapi = require('Hapi')
const Webpack = require('webpack')
const DashboardPlugin = require('webpack-dashboard/plugin')
const Config = require('../config/webpack.config.dev.js')

const server = new Hapi.Server()
const host = 'localhost'
const port = 8000
server.connection({ host, port })

const stats = {
  // Add asset Information
  assets: true,
  // Sort assets by a field
  assetsSort: 'field',
  // Add information about cached (not built) modules
  cached: true,
  // Add children information
  children: false,
  // Add chunk information (setting this to `false` allows for a less verbose output)
  chunks: false,
  // Add built modules information to chunk information
  chunkModules: true,
  // Add the origins of chunks and chunk merging info
  chunkOrigins: true,
  // Sort the chunks by a field
  chunksSort: 'field',
  // Context directory for request shortening
  context: '../src/',
  // `webpack --colors` equivalent
  colors: true,
  // Add errors
  errors: true,
  // Add details to errors (like resolving log)
  errorDetails: true,
  // Add the hash of the compilation
  hash: true,
  // Add built modules information
  modules: true,
  // Sort the modules by a field
  modulesSort: 'field',
  // Add public path information
  publicPath: true,
  // Add information about the reasons why modules are included
  reasons: true,
  // Add the source code of modules
  source: true,
  // Add timing information
  timings: true,
  // Add webpack version information
  version: true,
  // Add warnings
  warnings: true
}

const compiler = Webpack(
  Config({
    dev: true,
    staging: process.argv.indexOf('--env.staging') > -1,
    production: process.argv.indexOf('--env.production') > -1,
    logs: true, // turns on __DEVELOPMENT__ NOT FOR WEBPACK API
    minimize: false
  })
)

// compiler.apply(new DashboardPlugin())

const devMiddleware = require('webpack-dev-middleware')(compiler, {
  host,
  port,
  historyApiFallback: true,
  // quiet: true,
  stats,
  // noInfo: true,
  clientLogLevel: 'none',
  overlay: {
    warnings: true,
    errors: true
  }
})

const hotMiddleware = require('webpack-hot-middleware')(compiler)

server.ext('onRequest', (request, reply) => {
  devMiddleware(request.raw.req, request.raw.res, devError => {
    if (devError) {
      return reply(devError)
    }

    return reply.continue()
  })
})

server.ext('onRequest', (request, reply) => {
  hotMiddleware(request.raw.req, request.raw.res, err => {
    if (err) {
      return reply(err)
    }

    return reply.continue()
  })
})

server.ext('onPreResponse', (request, reply) => {
  const filename = Path.join(compiler.outputPath, 'index.html')
  compiler.outputFileSystem.readFile(filename, (fileReadErr, result) => {
    if (fileReadErr) {
      return reply(fileReadErr)
    }

    reply(result).type('text/html')
  })
})

server.start(err => {
  if (err) {
    throw err
  }
})
