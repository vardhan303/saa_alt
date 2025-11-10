module.exports = {
  root: true,
  env: { browser: true, es2023: true, node: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: 'detect' } },
  plugins: ['react'],
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  rules: {
    'react/prop-types': 'off'
  }
};
