const path = require("path");

module.exports = function override(config, env) {
  // Replace deprecated webpack-dev-server options with the new setupMiddlewares option
  if (process.env.NODE_ENV === "development") {
    config.devServer = {
      ...config.devServer,
      setupMiddlewares: (middlewares, devServer) => {
        // Handle any custom middleware setup here if needed
        return middlewares;
      },
      // Remove deprecated options
      onBeforeSetupMiddleware: undefined,
      onAfterSetupMiddleware: undefined,
    };
  }

  // Add a rule to handle the autoprefixer warning for bootstrap-dark-5
  const cssRules = config.module.rules.find(
    (rule) => rule.oneOf && Array.isArray(rule.oneOf)
  ).oneOf;

  const cssLoaders = cssRules.filter(
    (rule) =>
      rule.use &&
      Array.isArray(rule.use) &&
      rule.use.some(
        (loader) => loader.loader && loader.loader.includes("postcss-loader")
      )
  );

  cssLoaders.forEach((rule) => {
    const postcssLoader = rule.use.find(
      (loader) => loader.loader && loader.loader.includes("postcss-loader")
    );

    if (
      postcssLoader &&
      postcssLoader.options &&
      postcssLoader.options.postcssOptions
    ) {
      postcssLoader.options.postcssOptions.plugins = [
        require("postcss-flexbugs-fixes"),
        [
          require("postcss-preset-env"),
          {
            autoprefixer: {
              flexbox: "no-2009",
              // Add a replacement rule for color-adjust
              replace: {
                "color-adjust": "print-color-adjust",
              },
            },
            stage: 3,
          },
        ],
      ];
    }
  });

  return config;
};
