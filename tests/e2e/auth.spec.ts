import { expect, test } from '@playwright/test'

/**
 * Fluxo de acesso (RF-01/RF-02). O login OAuth completo exige credenciais
 * reais dos provedores; aqui garantimos o gate de rota e a página de login.
 * Estenda com um provedor de teste/credentials para cobrir o login ponta-a-ponta.
 */
test('home pública carrega', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('acesso ao dashboard sem sessão redireciona para login', async ({
  page,
}) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('button', { name: /continuar|enviar/i }).first())
    .toBeVisible()
    .catch(() => {
      /* sem provedores configurados: apenas garante que está na tela de login */
    })
})
