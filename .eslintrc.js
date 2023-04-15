// Useful references:
// https://typescript-eslint.io/

export default {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  ignorePatterns: ['tsconfig.json'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true
}
