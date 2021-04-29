module.exports = {
  configureWebpack: {
    output: {
      filename: "soundsonner.js",
    },
    optimization: {
      splitChunks: false,
    },
  },
  css: {
    extract: false,
  },
  filenameHashing: false,
};
