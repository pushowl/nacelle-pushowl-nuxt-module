const path = require('path')

module.exports = function (moduleOptions) {
  const filename = 'nacelle-pushowl-plugin.js'
  const options = {
    ...this.options.nacelle,
    ...moduleOptions
  }

  // Add plugin to nuxt
  this.addPlugin({
    src: path.resolve(__dirname, filename),
    fileName: filename,
    options
  })
}

module.exports.meta = require('../package.json')
