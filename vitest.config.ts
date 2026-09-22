import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Valores dummy para `env.server.ts` validar. Qualquer módulo que puxe o
    // logger ou o db acaba importando o env; sem isto, cada arquivo de teste
    // teria que mockar `@/lib/env.server` só para conseguir carregar.
    // Nenhum teste abre conexão: repositories e mailer são sempre mockados.
    env: {
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db?sslmode=require',
      AUTH_SECRET: 'test-secret-nao-usado-em-runtime',
      NEXT_PUBLIC_APP_NAME: 'Projeto Modelo',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'tests/e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      /**
       * Cobertura medida sobre a lógica que o Princípio V manda testar:
       * schemas, services, repositories, utils e o que vive em `lib`.
       *
       * `app/` e `components/` ficam de fora de propósito. Página e
       * componente de apresentação são cobertos por E2E, não por unitário;
       * mantê-los na conta produziria um número grande e sem significado, do
       * tipo que faz alguém escrever teste de render só para mover a métrica.
       */
      include: [
        'src/actions/**',
        'src/lib/**',
        'src/repositories/**',
        'src/schemas/**',
        'src/services/**',
        'src/utils/**',
      ],
      exclude: ['**/*.test.{ts,tsx}', 'src/lib/env.*.ts'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // `server-only` lança erro fora do runtime RSC; neutraliza nos testes.
      'server-only': fileURLToPath(
        new URL('./src/test/empty.ts', import.meta.url),
      ),
    },
  },
})
