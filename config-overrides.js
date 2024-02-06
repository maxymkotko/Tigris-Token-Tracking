/* config-overrides.js */
const webpack = require('webpack');
module.exports = function override(config, env) {
  //do stuff with the webpack config...

  config.resolve.fallback = {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve("stream-browserify"),
    assert: require.resolve("assert/")
  };
  config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
  entry = '.src/index.tsx',
    config.module = {
      rules: [
        {
          test: /\.(ts|tsx|js)$/,
          exclude: /node_modules/,
          use: {
            loader: "ts-loader"
          }
        },
        {
          test: /\.(css)$/i,
          use: ["style-loader", "css-loader"],
          include: [/node_modules/, /src/]
        },
        {
          oneOf: [
            {
              test: /\.svg$/,
              type: "asset/inline",
              // ...
            },
            {
              test: /\.(jpg|png|svg)$/,
              type: "asset/resource",
              // ...
            },
          ]
        },
      ]
    },
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
    );
  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false
    }
  });

  return config;
}