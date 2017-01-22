const path = require('path')

const isDev = process.env.NODE_ENV !== 'production'

module.exports = {
  entry: {
    app: [
      'intersection-observer',
      './src/js/index.js',
    ],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  devtool: isDev && 'source-map',
}
