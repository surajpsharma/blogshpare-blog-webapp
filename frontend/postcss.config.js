module.exports = {
  plugins: [
    require("autoprefixer")({
      overrideBrowserslist: [">0.2%", "not dead", "not op_mini all"],
      // Add a replacement rule for color-adjust to print-color-adjust
      replace: {
        "color-adjust": "print-color-adjust",
      },
    }),
  ],
};
