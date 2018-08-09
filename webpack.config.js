var path = require('path');

module.exports = {
    entry: './app.js',
    output: {
      path: path.resolve('dist'),
      filename: 'app.bundle.js'
    }
  };