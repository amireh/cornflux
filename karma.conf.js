const path = require('path');
const root = path.resolve(__dirname);

module.exports = function (config) {
  config.set({
    plugins: [
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-webpack',
      'karma-coverage',
    ],

    browsers: [ 'ChromeWithoutSandbox' ],

    customLaunchers: {
      ChromeWithoutSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-default-browser-check',
          '--no-first-run',
          '--disable-default-apps',
          '--disable-popup-blocking',
          '--disable-translate',
          '--disable-web-security',
        ]
      }
    },

    coverageReporter: {
      dir: path.join(root, 'coverage'),
      subdir: '.',
      reporters: [
        { type: 'json', file: 'report.json' },
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },

    frameworks: [
      'mocha'
    ],

    files: [
      'src/__tests__/*.test.js'
    ],

    preprocessors: {
      'src/__tests__/*.test.js': [ 'webpack' ]
    },

    reporters: [ 'dots', 'coverage' ],

    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.js$/,
            include: path.join(root, 'src'),
            loader: 'babel-loader',
            options: {
              babelrc: false,
              presets: [ 'env', 'react' ],
              plugins: [
                ['istanbul', {
                  exclude: [
                    "**/__tests__"
                  ]
                }]
              ]
            }
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
      noInfo: true,
      quiet: true,
      stats: false
    }
  });
};
