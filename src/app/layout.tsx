import type { Metadata, Viewport } from 'next'
import { Figtree } from 'next/font/google'
import { ThemeProvider } from '@/providers/theme-provider'
import { APP } from '@/constants/app'
import './globals.css'

/*
  Figtree: geométrica aberta, com números tabulares (valores alinhados em
  colunas). A variável fica no <html>: é em :root que --font-sans a resolve.
*/
const fontSans = Figtree({
  subsets: ['latin'],
  variable: '--font-app',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(APP.url),
  title: {
    default: APP.name,
    template: `%s · ${APP.name}`,
  },
  description: APP.description,
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f4f0' },
    { media: '(prefers-color-scheme: dark)', color: '#121317' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={fontSans.variable} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/*
            Atalho de teclado obrigatório para quem navega por Tab: sem ele,
            chegar ao conteúdo exige atravessar a navegação inteira em toda
            página (WCAG 2.4.1). Invisível até receber foco.
          */}
          <a
            href="#conteudo"
            className="focus:bg-surface focus:shadow-pop sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
          >
            Pular para o conteúdo
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
