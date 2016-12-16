var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path');

module.exports = {
  context: path.join(__dirname, "static/src"),
  devtool: debug ? "inline-sourcemap" : null,
  entry: "./js/client.jsx",
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      webworkify: 'webworkify-webpack',
      'mapbox-gl': path.resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js'),
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
          plugins: ['react-html-attrs', 'transform-class-properties', 'transform-decorators-legacy'],
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.jsx?$/,
        include: path.resolve(__dirname, 'node_modules/webworkify/index.js'),
        loader: 'worker'
      },
      { test: /\.css$/, loader: 'style!css' },
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
  plugins: debug ? [] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};
