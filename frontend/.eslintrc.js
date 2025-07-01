module.exports = {
  extends: ["react-app", "react-app/jest"],
  rules: {
    "jsx-a11y/img-redundant-alt": "off", // Disable the redundant alt attribute warning
    "react-hooks/exhaustive-deps": "warn", // Keep as warning but don't fail the build
  },
};
