const { defineConfig, globalIgnores } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
  globalIgnores(['.expo/**', 'coverage/**', 'dist/**']),
  expoConfig,
  {
    rules: {
      // Axios intentionally exposes instance helpers on its default export.
      'import/no-named-as-default-member': 'off',
      // Reanimated shared values rely on mutating .value inside hooks and gestures
      'react-hooks/immutability': 'off',
    },
  },
])
