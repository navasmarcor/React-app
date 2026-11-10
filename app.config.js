// Adds settings that depend on where the app is built. Everything else lives in app.json.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    // The web version is published under https://navasmarcor.github.io/React-app
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
