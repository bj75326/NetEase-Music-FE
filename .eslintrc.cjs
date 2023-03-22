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
    "@typescript-eslint/no-unsafe-assignment": 1,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        "checksVoidReturn": {
          "arguments": false,
          "attributes": false
        }
      }
    ],
    "@typescript-eslint/unbound-method": 0,
    "@typescript-eslint/no-namespace": 0,
  }
}
