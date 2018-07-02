const webpack = require('webpack');
const path = require('path');
const root = path.resolve(__dirname);
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: 'production',

  output: {
    filename: 'cornflux.js',
    path: path.join(root, 'dist'),
  },

  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: [ path.join(root, 'src') ],
        exclude: [ /\.test.js$/ ],
        loader: 'babel-loader',
        options: {
          presets: [ 'env', 'react' ]
        }
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    // new BundleAnalyzerPlugin(),
  ],
};