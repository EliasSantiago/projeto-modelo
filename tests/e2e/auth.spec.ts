import { expect, test } from '@playwright/test'

/**
 * Gate de acesso (RF-01/RF-02, SEC-04/SEC-12).
 *
 * Cobre o que dá para cobrir sem credenciais reais de provedor: rota pública
 * abre, rota protegida barra anônimo, e a sessão não é forjável por cookie.
 * Para o login ponta-a-ponta, semeie um usuário e use o provider Credentials.
 */

test('home pública carrega', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('rota protegida sem sessão redireciona para o login', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/login/)
})

test('o redirect preserva o destino em callbackUrl', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/callbackUrl=(%2F|\/)admin/)
})

test('a tela de login renderiza o formulário de e-mail e senha', async ({
  page,
}) => {
  await page.goto('/login')
  await expect(page.getByLabel(/e-?mail/i)).toBeVisible()
  await expect(page.getByLabel(/senha/i)).toBeVisible()
})

test('cookie de sessão falsificado não dá acesso à área restrita', async ({
  page,
  context,
}) => {
  // O proxy só confere a PRESENÇA do cookie; quem valida o conteúdo é o
  // `requireAdmin` no servidor. Este teste trava essa fronteira: se um dia
  // alguém passar a confiar no cookie no proxy, ele quebra.
  await context.addCookies([
    {
      name: 'authjs.session-token',
      value: 'token-invalido-forjado',
      domain: 'localhost',
      path: '/',
    },
  ])

  await page.goto('/admin')

  // Passa o proxy, mas não passa do servidor: nunca renderiza a página.
  await expect(
    page.getByRole('heading', { name: 'Administração' }),
  ).toBeHidden()
})
