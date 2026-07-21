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
