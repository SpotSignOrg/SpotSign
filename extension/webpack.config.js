const path = require("path");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");


module.exports = {
  entry: {
    background_scripts: "./background_scripts/background.js",
    content_scripts: "./content_scripts/content.js",
    popup: "./popup/popup.js"
  },
  output: {
    path: path.resolve(__dirname, "addon"),
    filename: "[name]/index.js"
  },
  plugins: [
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "../signer")
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  mode: "development",
  devtool: "source-map",
};
