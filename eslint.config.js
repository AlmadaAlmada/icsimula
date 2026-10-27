// ESLint 9 (flat config): lint + análise estática de código.
import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import security from 'eslint-plugin-security';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'reports', 'node_modules'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strict, // regras de análise estática do TypeScript
      security.configs.recommended, // padrões inseguros (eval, regex, object injection...)
      jsxA11y.flatConfigs.recommended, // acessibilidade
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      complexity: ['error', 12],
      'max-depth': ['error', 3],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: { 'security/detect-non-literal-regexp': 'off' },
  },
);
