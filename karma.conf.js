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

    browsers: [ 'Chrome' ],

    coverageReporter: {
      dir: path.join(root, 'coverage'),
      subdir: '.',
      reporters: [
        { type: 'json', file: 'report.json' },
        { type: 'html' },
        { type: 'text-summary' }
      ],
      check: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        }
      },
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
                  exclude:
                    "**/*.test.js",
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
      noInfo: true
    }
  });
};
