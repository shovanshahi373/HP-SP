const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/scripts/rejoin.runner.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    library: "MyBundle",
    libraryTarget: "window",
    // Remove libraryExport so that window.MyBundle is the full object
    libraryExport: undefined,
  },
  devtool: "source-map",
  devServer: {
    static: path.resolve(__dirname, "dist"),
    port: 9000,
  },
};
