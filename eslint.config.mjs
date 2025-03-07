import { FlatCompat } from '@eslint/eslintrc';
import prettierPlugin from 'eslint-plugin-prettier';
import tsEslint from 'typescript-eslint';

const compat = new FlatCompat({
  baseDirectory: import.meta.url,
});

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...tsEslint.configs.recommended,
  ...compat.extends('airbnb-base'),
  ...compat.extends('prettier'),
  {
    ignores: ['dist', 'eslint.config.mjs'],
  },
  {
    files: ['src/**/*.{js,mjs,cjs,ts}', 'tests/**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    plugins: { prettier: prettierPlugin },
    rules: {
      'prettier/prettier': 'error',
      'import/extensions': ['error', 'ignorePackages', { ts: 'never' }],
      'no-console': 'warn',
      'import/no-extraneous-dependencies': 'off',
      'no-use-before-define': 'off',
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.ts', '.js'],
        },
      },
    },
  },
];
