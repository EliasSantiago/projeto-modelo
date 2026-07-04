import next from 'eslint-config-next'

/**
 * ESLint flat config (ESLint 10). eslint-config-next 16 já exporta um array
 * de flat config nativo — não é necessário FlatCompat.
 */
const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      '.archive-horizon/**',
      'drizzle/**',
      'playwright-report/**',
      'test-results/**',
      'coverage/**',
    ],
  },
  ...next,
]

export default eslintConfig
