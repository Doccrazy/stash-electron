module.exports = {
  name: 'plugin-native-build-env',
  factory: () => ({
    hooks: {
      setupScriptEnvironment(project, env) {
        env.NODE_OPTIONS = (env.NODE_OPTIONS || '') + ` -r ${__dirname}/buildEnv.js`
      },
    },
  })
};