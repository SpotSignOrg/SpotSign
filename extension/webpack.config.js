const path = require("path");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const CopyPlugin = require('copy-webpack-plugin');


module.exports = {
  entry: {
    background_scripts: "./addon/background_scripts/background.js",
    content_scripts: "./addon/content_scripts/content.js",
    popup: "./addon/popup/popup.js"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name]/index.js"
  },
  resolve: {
    alias: {
      addon: path.resolve(__dirname, 'addon/'),
      signer: path.resolve(__dirname, '../signer/')
    }
  },
  plugins: [
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "../signer")
    }),
    new CopyPlugin([
      { from: './addon/manifest.json', to: 'manifest.json' },
      { from: './addon/icons/pen.png', to: 'icons/pen.png' },
      { from: './addon/popup/popup.html', to: 'popup/popup.html' },

    ]),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader'
        }]
      }
    ]
  },
  mode: "development",
  devtool: "source-map",
};
