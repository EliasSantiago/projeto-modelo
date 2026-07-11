import {
  ArrowPathIcon,
  HomeIcon,
  KeyIcon,
  ShoppingBagIcon,
  TableCellsIcon,
  UserIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'
import type { ComponentType, SVGProps } from 'react'
import { ROUTES } from '@/constants/routes'

export type PageAccess = 'public' | 'auth'
export type PageCategory = 'Autenticação' | 'Admin (boilerplate)'

export type SitePage = {
  title: string
  description: string
  href: string
  access: PageAccess
  category: PageCategory
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

/** Registro central das páginas, usado na home e na documentação. */
export const SITE_PAGES: SitePage[] = [
  {
    title: 'Login',
    description: 'Entrar com e-mail/senha ou provedores OAuth.',
    href: ROUTES.login,
    access: 'public',
    category: 'Autenticação',
    icon: KeyIcon,
  },
  {
    title: 'Criar conta',
    description: 'Cadastro com nome, e-mail e senha (hash bcrypt).',
    href: ROUTES.register,
    access: 'public',
    category: 'Autenticação',
    icon: UserPlusIcon,
  },
  {
    title: 'Recuperar conta',
    description: 'Solicitar link de redefinição de senha por e-mail.',
    href: ROUTES.forgotPassword,
    access: 'public',
    category: 'Autenticação',
    icon: ArrowPathIcon,
  },
  {
    title: 'Main Dashboard',
    description: 'Widgets de métricas, gráficos e a feature de tarefas.',
    href: ROUTES.dashboard,
    access: 'public',
    category: 'Admin (boilerplate)',
    icon: HomeIcon,
  },
  {
    title: 'Data Tables',
    description: 'Tabela com ordenação e paginação no cliente.',
    href: ROUTES.tables,
    access: 'public',
    category: 'Admin (boilerplate)',
    icon: TableCellsIcon,
  },
  {
    title: 'Marketplace',
    description: 'Grade de cards estilo NFT marketplace.',
    href: ROUTES.marketplace,
    access: 'public',
    category: 'Admin (boilerplate)',
    icon: ShoppingBagIcon,
  },
  {
    title: 'Perfil',
    description: 'Perfil do usuário com dados reais da sessão.',
    href: ROUTES.profile,
    access: 'public',
    category: 'Admin (boilerplate)',
    icon: UserIcon,
  },
]

export const PAGE_CATEGORIES: PageCategory[] = [
  'Autenticação',
  'Admin (boilerplate)',
]
