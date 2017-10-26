const BaseConfig = require('./webpack.config.base.js')

module.exports = function (options) {
  const baseConfig = BaseConfig(options)

  let stagingPlugins = []

  if (options.deploy) {
    const S3Plugin = require('webpack-s3-plugin')
    const AwsConfig = require('../.aws.json')

    stagingPlugins = stagingPlugins.concat([
      new S3Plugin({
        s3Options: {
          region: AwsConfig.staging.REGION,
          accessKeyId: AwsConfig.staging.AWS_ACCESS_KEY_ID,
          secretAccessKey: AwsConfig.staging.AWS_SECRET_ACCESS_KEY
        },
        s3UploadOptions: {
          Bucket: AwsConfig.staging.BUCKET_NAME
        },
        cloudfrontInvalidateOptions: {
          DistributionId: AwsConfig.staging.CLOUDFRONT_DISTRIBUTION_ID,
          Items: ['/*']
        }
      })
    ])
  }

  return Object.assign({}, baseConfig, {
    devtool: 'source-map',
    plugins: stagingPlugins.concat(baseConfig.plugins)
  })
}
