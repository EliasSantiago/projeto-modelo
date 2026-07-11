/**
 * Dados fictícios (boilerplate) para as telas do admin. Substitua por dados
 * reais vindos dos services/repositories quando for construir a feature.
 */

export const revenueSeries = [18, 24, 22, 30, 28, 38, 34, 44, 40, 52, 48, 60]

export const revenueLabels = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

export const weeklySeries = [12, 20, 14, 26, 18, 30, 22]

export const weeklyLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export type TableRow = {
  name: string
  status: 'Aprovado' | 'Pendente' | 'Erro'
  date: string
  progress: number
}

export const tableRows: TableRow[] = [
  {
    name: 'Marketing landing',
    status: 'Aprovado',
    date: '12 Jan 2026',
    progress: 75,
  },
  {
    name: 'App mobile v2',
    status: 'Pendente',
    date: '21 Fev 2026',
    progress: 35,
  },
  {
    name: 'Dashboard interno',
    status: 'Aprovado',
    date: '13 Mar 2026',
    progress: 90,
  },
  {
    name: 'Integração Neon',
    status: 'Erro',
    date: '05 Abr 2026',
    progress: 10,
  },
  {
    name: 'Design system',
    status: 'Aprovado',
    date: '18 Mai 2026',
    progress: 60,
  },
  {
    name: 'Migração Auth.js',
    status: 'Pendente',
    date: '30 Jun 2026',
    progress: 45,
  },
  { name: 'Testes E2E', status: 'Aprovado', date: '14 Jul 2026', progress: 80 },
  {
    name: 'Documentação',
    status: 'Pendente',
    date: '02 Ago 2026',
    progress: 25,
  },
]

export type NftItem = {
  id: string
  title: string
  author: string
  price: string
  gradient: string
}

export const nftItems: NftItem[] = [
  {
    id: '1',
    title: 'Abstract Colors',
    author: 'Elias F.',
    price: '0.91 ETH',
    gradient: 'from-brand-400 to-brand-600',
  },
  {
    id: '2',
    title: 'ETH AI Brain',
    author: 'Nick W.',
    price: '0.70 ETH',
    gradient: 'from-pink-400 to-purple-600',
  },
  {
    id: '3',
    title: 'Mesh Gradients',
    author: 'Will S.',
    price: '2.91 ETH',
    gradient: 'from-orange-400 to-red-500',
  },
  {
    id: '4',
    title: 'Swipe Circles',
    author: 'Peter W.',
    price: '0.42 ETH',
    gradient: 'from-cyan-400 to-blue-600',
  },
  {
    id: '5',
    title: 'Colorful Heaven',
    author: 'Manny G.',
    price: '1.30 ETH',
    gradient: 'from-emerald-400 to-teal-600',
  },
  {
    id: '6',
    title: '3D Cubes Art',
    author: 'Selena L.',
    price: '0.28 ETH',
    gradient: 'from-indigo-400 to-brand-600',
  },
]

export const dashboardWidgets = [
  { label: 'Receita', value: 'R$ 34.500' },
  { label: 'Gastos', value: 'R$ 12.900' },
  { label: 'Novos clientes', value: '1.245' },
  { label: 'Projetos', value: '38' },
]
