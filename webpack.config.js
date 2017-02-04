var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path');

module.exports = {
  context: path.resolve(__dirname + '/'),
  devtool: debug ? "inline-sourcemap" : false,
  entry: "./static/src/js/client.jsx",
  resolveLoader: {
    modules : ['node_modules']
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules : [
      {
        test : /\.jsx?$/,
        exclude : /node_modules/,
        use : {
          loader : 'babel-loader',
          query : {
            presets: ['react', 'es2015', 'stage-0'],
            plugins: ['react-html-attrs', 'transform-class-properties', 'transform-decorators-legacy'],
          }
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      { 
        test: /\.css$/, 
        loader: ['style-loader', 'css-loader']
      },
      { 
        test: /\.png$/, 
        loader: "url-loader?mimetype=image/png" 
      }
    ]
  },
  output: {
    path: __dirname + '/static/src/',
    filename: 'client.min.js',
    publicPath: '/',
  },
  plugins: debug ? 
    [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin()
    ] : [
    new webpack.DefinePlugin({
      'process.env' : {'NODE_ENV' : JSON.stringify('production')}
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};
