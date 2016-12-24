const path = require('path');
const root = path.resolve(__dirname);

module.exports = function (config) {
  config.set({
    plugins: [
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-webpack',
    ],

    browsers: [ 'Chrome' ],

    frameworks: [
      'mocha'
    ],

    files: [
      'src/__tests__/*.test.js'
    ],

    preprocessors: {
      'src/__tests__/*.test.js': [ 'webpack' ]
    },

    reporters: [ 'dots' ],

    webpack: {
      externals: { 'Promise': true },
      module: {
        loaders: [
          {
            test: /\.js$/,
            include: path.join(root, 'src'),
            loader: 'babel'
          }
        ]
      }
    },

    client: {
      captureConsole: true,

      mocha: {
        reporter: 'html', // change Karma's debug.html to the mocha web reporter
        ui: 'bdd',
        timeout: 2000
      }
    },

    webpackServer: {
      noInfo: true
    }
  });
};