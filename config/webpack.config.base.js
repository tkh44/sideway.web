const Path = require('path')
const Webpack = require('webpack')
const BuildHtmlPlugin = require('./build-html-plugin')
const TransferWebpackPlugin = require('transfer-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const OfflinePlugin = require('offline-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const BabiliPlugin = require('babili-webpack-plugin')
// This is temp while we get Peter's permissions settled
// const SidewayProdConfig = require('@sideway/setup/lib/env/prod');
// const SidewayDevConfig = require('@sideway/setup/lib/env/dev');

const BASE_PATH = Path.resolve(__dirname, '..')
const LIB_PATH = Path.resolve(BASE_PATH, 'lib')
const PUBLIC_PATH = Path.resolve(LIB_PATH, 'public')
const NODE_MODULES_PATH = Path.resolve(__dirname, '../node_modules')
const pkg = require('../package.json')

const BABEL_INCLUDES = [
  LIB_PATH
]

Object.keys(pkg.dependencies).forEach(dep => {
  try {
    const depPkg = require('../node_modules/' + dep + '/package.json')
    const nextMain = depPkg.module || depPkg['jsnext:main']
    if (nextMain) {
      const nextMainDir = nextMain.split('/')[0]
      BABEL_INCLUDES.push(
        Path.resolve(BASE_PATH, 'node_modules', dep, nextMainDir)
      )
    }
  } catch (e) {}
})

module.exports = function (options) {
  const SidewayProdConfig = {
    server: {
      source: {
        root: 'sideway.com',
        scheme: 'https',
        short: 'sdwy.it',
        embed: 'sidewayembed.com'
      },
      api: 8001,
      login: 8002,
      short: 8003,
      twitter: 8004,
      embed: 8005
    }
  }
  const SidewayDevConfig = {
    server: {
      source: {
        root: 'sdwy.co',
        scheme: 'https',
        short: 'sdwy.it',
        embed: 'embed.sdwy.co'
      },
      api: 8001,
      login: 8002,
      short: 8003,
      twitter: 8004,
      embed: 8005
    }
  }

  process.env.NODE_ENV = options.production ? 'production' : 'development'

  return {
    devtool: options.minimize ? 'source-map' : 'cheap-module-source-map',
    performance: { hints: false },
    entry: {
      app: Path.resolve(LIB_PATH, 'index.js')
    },
    output: {
      path: Path.resolve(BASE_PATH, 'dist'),
      filename: '[name].[hash].js',
      publicPath: '/'
    },
    recordsPath: Path.resolve(
      __dirname,
      '../tmp/webpack_config/webpack-records.json'
    ),
    resolve: {
      modules: [
        LIB_PATH,
        PUBLIC_PATH,
        NODE_MODULES_PATH,
        'components',
        'lib',
        'node_modules'
      ],
      mainFields: ['jsnext:main', 'browser', 'main'],
      alias: {
        // 'react-dom': 'react-dom/lib/ReactDOMFiber'
      }
    },
    module: {
      rules: [
        // {
        //   test: /\.js$/,
        //   loader: 'standard-loader',
        //   exclude: /node_modules/,
        //   enforce: 'pre'
        // },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: BABEL_INCLUDES,
          query: {
            cacheDirectory: true
          }
        },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader'
          })
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          loaders: [
            {
              loader: 'file-loader',
              query: { name: 'images/[name]-[hash:12].[ext]' }
            }
          ],
          include: PUBLIC_PATH
        },
        {
          test: /\.mp4$/,
          loaders: [
            {
              loader: 'file-loader',
              query: { name: 'video/[name]-[hash:12].[ext]' }
            }
          ],
          include: PUBLIC_PATH
        },
        {
          test: /\.ico$/,
          loader: 'file-loader',
          query: { mimetype: 'image/x-icon', limit: 0 },
          include: PUBLIC_PATH
        },

        { test: /\.json$/, loader: 'json-loader' },

        {
          test: /\.(ttf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
          loader: 'file-loader',
          query: { name: 'fonts/[name]-[hash:12].[ext]' }
        },
        { test: /\.md$/, loader: 'html-loader!markdown-loader' }
      ]
    },
    plugins: [
      new Webpack.LoaderOptionsPlugin({
        minimize: options.production,
        debug: !options.production
      }),
      new Webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(
            options.minimize ? 'production' : 'development'
          )
        },
        __TEST__: options.test,
        __DEVELOPMENT__: !!options.logs, // Enables logging in console,
        __PROD__: options.production
      }),
      new Webpack.ProvidePlugin({
        React: 'react'
      }),
      new LodashModuleReplacementPlugin({
        paths: true
      }),
      new ExtractTextPlugin('styles.css'),
      new Webpack.NamedModulesPlugin(),
      new Webpack.optimize.MinChunkSizePlugin({ minChunkSize: 10000 }),
      new Webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function (module) {
          return module.context &&
            module.context.indexOf('node_modules') !== -1
        }
      }),
      new Webpack.optimize.CommonsChunkPlugin({
        name: 'manifest'
      }),
      new TransferWebpackPlugin(
        [
          { from: 'favicon/app', to: 'favicon' },
          { from: 'favicon/ico' },
          { from: 'robots' }
        ],
        Path.resolve(LIB_PATH, 'public')
      ),
      new BuildHtmlPlugin({
        templatePath: Path.resolve(LIB_PATH, 'index.html'),
        outputPath: Path.resolve(BASE_PATH, 'dist', 'index.html'),
        publicPath: '/',
        sidewayConfig: options.dev && !options.staging
          ? SidewayDevConfig
          : SidewayProdConfig,
        development: options.dev,
        staging: options.staging,
        production: options.production
      })
    ]
      .concat(
        options.production
          ? [
              // new Webpack.optimize.UglifyJsPlugin({
              //   sourceMap: !options.production,
              //   compress: {
              //     warnings: false,
              //     drop_console: true,
              //     screw_ie8: true
              //   },
              //   mangle: {
              //     screw_ie8: true
              //   },
              //   output: {
              //     comments: false,
              //     screw_ie8: true
              //   }
              // }),
            new BabiliPlugin(),
            new BundleAnalyzerPlugin({
                // Can be `server`, `static` or `disabled`.
                // In `server` mode analyzer will start HTTP server to show bundle report.
                // In `static` mode single HTML file with bundle report will be generated.
                // In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`.
              analyzerMode: 'server',
                // Host that will be used in `server` mode to start HTTP server.
              analyzerHost: '127.0.0.1',
                // Port that will be used in `server` mode to start HTTP server.
              analyzerPort: 9006,
                // Path to bundle report file that will be generated in `static` mode.
                // Relative to bundles output directory.
              reportFilename: 'report.html',
                // Automatically open report in default browser
              openAnalyzer: true,
                // If `true`, Webpack Stats JSON file will be generated in bundles output directory
              generateStatsFile: false,
                // Name of Webpack Stats JSON file that will be generated if `generateStatsFile` is `true`.
                // Relative to bundles output directory.
              statsFilename: 'stats.json',
                // Options for `stats.toJson()` method.
                // For example you can exclude sources of your modules from stats file with `source: false` option.
                // See more options here: https://github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
              statsOptions: null,
                // Log level. Can be 'info', 'warn', 'error' or 'silent'.
              logLevel: 'info'
            })
          ]
          : []
      )
      .concat(
        options.production || options.staging || options.dev
          ? [
            new OfflinePlugin({
              version: '[hash]',
              AppCache: {
                FALLBACK: { '/': '/' }
              },
              ServiceWorker: {
                output: 'sw.js',
                entry: Path.resolve(LIB_PATH, 'workers/sw.js'),
                scope: '/',
                events: true
              },
              autoUpdate: true,
              safeToUseOptionalCaches: true,
              relativePaths: false,
              publicPath: '/',
              cacheMaps: [
                {
                  match: /.*/,
                  to: '/',
                  requestTypes: ['navigate']
                }
              ]
            })
          ]
          : []
      )
  }
}
