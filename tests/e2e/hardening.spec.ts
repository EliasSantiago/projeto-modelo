import { expect, test } from '@playwright/test'

/**
 * Trava os controles de infraestrutura que são fáceis de perder num refactor
 * porque nenhuma tela quebra quando somem: header de segurança e health check.
 */

test('toda resposta carrega os security headers', async ({ request }) => {
  const response = await request.get('/')
  expect(response.ok()).toBe(true)

  const headers = response.headers()

  expect(headers['content-security-policy']).toContain(`default-src 'self'`)
  expect(headers['content-security-policy']).toContain(`frame-ancestors 'none'`)
  expect(headers['content-security-policy']).toContain(`object-src 'none'`)
  expect(headers['x-frame-options']).toBe('DENY')
  expect(headers['x-content-type-options']).toBe('nosniff')
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(headers['cross-origin-opener-policy']).toBe('same-origin')
  expect(headers['permissions-policy']).toContain('camera=()')

  // Não anunciar o framework é decisão do `next.config.ts`; se voltar, é
  // porque alguém removeu `poweredByHeader: false` sem perceber.
  expect(headers['x-powered-by']).toBeUndefined()
})

test('o health check responde sem cache', async ({ request }) => {
  const response = await request.get('/api/health')

  expect(response.status()).toBe(200)
  expect(response.headers()['cache-control']).toContain('no-store')

  const body = await response.json()
  expect(body.status).toBe('ok')
  expect(typeof body.timestamp).toBe('string')
})

test('o atalho "pular para o conteúdo" é o primeiro alvo do Tab', async ({
  page,
}) => {
  await page.goto('/')
  await page.keyboard.press('Tab')

  const focused = page.locator(':focus')
  await expect(focused).toHaveText(/pular para o conteúdo/i)
  await expect(focused).toHaveAttribute('href', '#conteudo')
})
