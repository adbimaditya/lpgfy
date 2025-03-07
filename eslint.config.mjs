import { FlatCompat } from '@eslint/eslintrc';
import prettierPlugin from 'eslint-plugin-prettier';
import path from 'path';
import tsEslint from 'typescript-eslint';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: import.meta.url,
});

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...tsEslint.configs.recommended,
  ...compat.extends('airbnb-base'),
  ...compat.extends('prettier'),
  {
    ignores: ['dist', 'eslint.config.mjs', 'playwright.config.ts'],
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
      '@typescript-eslint/no-explicit-any': 'warn',
      'prettier/prettier': 'error',
      'import/extensions': ['error', 'ignorePackages', { ts: 'never' }],
      'no-console': 'warn',
      'no-use-before-define': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/extensions': 'off',
      'import/prefer-default-export': 'off',
      'lines-between-class-members': 'off',
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
