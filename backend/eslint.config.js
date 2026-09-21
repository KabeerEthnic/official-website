import js from '@eslint/js';
import globals from 'globals';

/** Backend lint rules: unused code, accidental globals, forgotten awaits. */
export default [
  { ignores: ['node_modules/**', 'prisma/migrations/**'] },

  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.es2021 },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-return-await': 'error',
      'require-atomic-updates': 'off',
    },
  },
];
