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
          region: AwsConfig.production.REGION,
          accessKeyId: AwsConfig.production.AWS_ACCESS_KEY_ID,
          secretAccessKey: AwsConfig.production.AWS_SECRET_ACCESS_KEY
        },
        s3UploadOptions: {
          Bucket: AwsConfig.production.BUCKET_NAME
        },
        cloudfrontInvalidateOptions: {
          DistributionId: AwsConfig.production.CLOUDFRONT_DISTRIBUTION_ID,
          Items: ['/*']
        }
      })
    ])
  }

  return Object.assign({}, baseConfig, {
    plugins: stagingPlugins.concat(baseConfig.plugins)
  })
}
