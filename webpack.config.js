var debug = process.env.NODE_ENV !== 'production'
var webpack = require('webpack')
var path = require('path')

module.exports = {
  context: path.resolve(__dirname + '/static/src'),
  devtool: debug ? 'inline-sourcemap' : null,
  entry: './js/client.jsx',
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias : {
      beerfeed : path.resolve(path.join(__dirname, 'static/src/js'))
    }
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015', 'stage-0'],
          plugins: ['react-html-attrs', 'transform-class-properties', 'transform-decorators-legacy']
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /mapbox-gl.+\.js$/,
        include: path.resolve(__dirname + '/node_modules/mapbox-gl-shaders/index.js'),
        loader: 'transform/cacheable?brfs'
      },
      { test: /\.css$/, loader: 'style!css' },
      {test: /\.less/, loader: 'css-loader!autoprefixer-loader!less-loader'},
      { test: /\.png$/, loader: 'url-loader?limit=100000' },
      { test: /\.jpg$/, loader: 'file-loader' }
    ],
    postLoaders: [{
      include: /node_modules\/mapbox-gl-shaders/,
      loader: 'transform',
      query: 'brfs'
    }]
  },
  output: {
    path: __dirname + "/static/src/",
    filename: "client.min.js"
  },
  plugins: debug ?
    [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ] : [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false })
    ]
}
