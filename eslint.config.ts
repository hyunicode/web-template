import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import perfectionist from 'eslint-plugin-perfectionist';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist/**', 'node_modules/**', 'template/dist/**', 'template/node_modules/**'] },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      perfectionist.configs['recommended-natural'],
      eslintConfigPrettier,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'separate-type-imports', prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'perfectionist/sort-modules': 'off',
      'perfectionist/sort-objects': 'off',
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          newlinesBetween: 1,
          internalPattern: ['^@/.+', '^#/.+'],
          groups: [
            'react',
            'type-import',
            ['value-builtin', 'value-external'],
            'type-internal',
            'value-internal',
            ['type-sibling', 'type-index'],
            ['value-sibling', 'value-index'],
            ['type-parent'],
            ['value-parent'],
            'side-effect',
            'side-effect-style',
            'style',
            'unknown',
          ],
          customGroups: [
            {
              groupName: 'react',
              elementNamePattern: ['^react$', '^react-dom$', '^react/.+', '^react-dom/.+'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['template/**/*.{js,jsx,ts,tsx}'],
    extends: [
      react.configs.flat.recommended ?? {},
      react.configs.flat['jsx-runtime'] ?? {},
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.recommended(),
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    files: ['**/*.test.ts'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['*.config.{js,ts}', 'eslint.config.ts', 'template/eslint.config.ts'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: globals.node,
    },
  },
);
