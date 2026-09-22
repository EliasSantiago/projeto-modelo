import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ThemeProvider } from '@/providers/theme-provider'
import { APP } from '@/constants/app'
import './globals.css'

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${fontSans.variable} antialiased`}>
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
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--color-background)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-2"
          >
            Pular para o conteúdo
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
