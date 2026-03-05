const pxToViewport = require("postcss-px-to-viewport-8-plugin");

module.exports = {
  plugins: [
    pxToViewport({
      viewportWidth: 375,
      viewportUnit: "vw",
      fontViewportUnit: "vw",
      unitPrecision: 6,
      minPixelValue: 1,
      mediaQuery: false,
      selectorBlackList: [".ignore-px2vw"]
    })
  ]
};
