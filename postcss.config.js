const autoprefixer = require("autoprefixer");
const postcssNested = require("postcss-nested");
const postcssPresetEnv = require("postcss-preset-env");
const postcssSimpleVars = require("postcss-simple-vars");

module.exports = {
  plugins: [
    autoprefixer,
    postcssNested,
    postcssSimpleVars,
    postcssPresetEnv({
      features: {
        "nesting-rules": true,
        "alpha-hex-colors": true,
      },
    }),
  ],
};
