const webpack = require('webpack');
const common = require('./common');

module.exports = {
  devtool: 'eval',

  resolve: common.resolve,

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ],

  module: common.getModuleConfigWithCustomLoaders(x => {
    if (x.id === 'js') {
      return Object.assign({}, x, {
        loaders: undefined,
        loader: 'babel',
      });
    }
    else {
      return x;
    }
  }),
};