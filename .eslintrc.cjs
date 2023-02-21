module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'plugin:prettier/recommended',
    'eslint-config-prettier',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  overrides: [],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: [ "./tsconfig.json" ],
    extraFileExtensions: [ '.vue' ],
  },
  plugins: [
    'vue',
    'prettier'
  ],
  rules: {
    "@typescript-eslint/strict-boolean-expressions": 0,
    "@typescript-eslint/no-unsafe-return": 1,

  }
}
