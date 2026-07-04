import {
  HomeIcon,
  ShoppingBagIcon,
  TableCellsIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import type { ComponentType, SVGProps } from 'react'
import { ROUTES } from '@/constants/routes'

export type NavItem = {
  label: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

/** Itens de navegação do admin shell (sidebar). */
export const ADMIN_NAV: NavItem[] = [
  { label: 'Main Dashboard', href: ROUTES.dashboard, icon: HomeIcon },
  { label: 'Data Tables', href: ROUTES.tables, icon: TableCellsIcon },
  { label: 'Marketplace', href: ROUTES.marketplace, icon: ShoppingBagIcon },
  { label: 'Perfil', href: ROUTES.profile, icon: UserIcon },
]
