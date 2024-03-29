module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', ['index', 'sibling', 'parent', 'object']],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {},
    },
  },
};
