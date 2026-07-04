import { clientEnv } from '@/lib/env.client'

/** Metadados estáticos da aplicação. */
export const APP = {
  name: clientEnv.NEXT_PUBLIC_APP_NAME,
  url: clientEnv.NEXT_PUBLIC_APP_URL,
  description:
    'Projeto modelo Next.js: seguro, escalável e pronto para produção.',
} as const
