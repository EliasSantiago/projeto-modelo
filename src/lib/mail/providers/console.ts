import 'server-only'
import type { MailProvider } from '../types'

/**
 * Provedor de desenvolvimento: imprime a mensagem no terminal em vez de
 * enviar. Existe para `pnpm dev` funcionar sem conta em serviço nenhum —
 * é assim que se pega o link de confirmação ou de recuperação localmente.
 *
 * `index.ts` recusa este provedor em produção: lá, e-mail que não sai é
 * perda silenciosa de dado.
 */
export function createConsoleProvider(): MailProvider {
  return {
    name: 'console',

    async send(message) {
      console.info(
        [
          '',
          '📧 [DEV] E-mail simulado (nenhum provedor configurado)',
          `   Para:    ${message.to}`,
          `   Assunto: ${message.subject}`,
          '   ---',
          message.text
            .split('\n')
            .map((line) => `   ${line}`)
            .join('\n'),
          '',
        ].join('\n'),
      )
    },
  }
}
