// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    // Global ignores. Build output and generated public-api barrels are not linted.
    ignores: [
      'dist/**',
      'coverage/**',
      '.angular/**',
      'node_modules/**',
      'projects/jrng-ui/src/lib/**',
    ],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // The public component API intentionally exposes `on`-prefixed outputs
      // (e.g. `(onClick)`, `(onChange)`) and aliased directive inputs
      // (e.g. `jTourStep`). Renaming these would be a breaking change, so the
      // corresponding conventions are disabled rather than enforced.
      '@angular-eslint/no-output-on-prefix': 'off',
      '@angular-eslint/no-output-native': 'off',
      '@angular-eslint/no-input-rename': 'off',

      // `cond ? a() : b()` and `cond && a()` are used as concise statements.
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],

      // Existing tech debt: surfaced as warnings so they don't block the build
      // but stay visible for incremental cleanup. New code should still comply.
      '@angular-eslint/prefer-inject': 'warn',
      '@angular-eslint/use-lifecycle-interface': 'warn',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/prefer-function-type': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-useless-escape': 'warn',
    },
  },
  {
    // Library components/directives use the `j` prefix.
    files: ['projects/jrng-ui/**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'j', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'j', style: 'kebab-case' },
      ],
    },
  },
  {
    // Docs application uses the `app` prefix.
    files: ['projects/docs/**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      // Existing accessibility gaps: surfaced as warnings for incremental
      // cleanup rather than blocking the build.
      '@angular-eslint/template/interactive-supports-focus': 'warn',
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/label-has-associated-control': 'warn',
      '@angular-eslint/template/eqeqeq': 'warn',
    },
  },
);
