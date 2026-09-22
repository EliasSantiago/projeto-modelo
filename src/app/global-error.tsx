'use client'

/**
 * Último recurso: erro no próprio root layout (ou no provider de tema).
 *
 * Substitui o `<html>` inteiro, então precisa emitir as próprias tags e não
 * pode contar com NADA do layout — nem fonte, nem `ThemeProvider`, nem os
 * componentes de `components/ui`, que é exatamente o que pode ter quebrado.
 * Por isso o estilo é inline: uma tela feia que aparece vale mais que uma
 * bonita que também estoura.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '1rem',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#ffffff',
          color: '#1b2559',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Algo deu errado</h1>
        <p style={{ margin: 0, color: '#707eae' }}>
          A aplicação não conseguiu carregar. Recarregue a página em alguns
          instantes.
        </p>
        {error.digest && (
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#707eae' }}>
            Código do erro: <code>{error.digest}</code>
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          style={{
            cursor: 'pointer',
            borderRadius: '0.75rem',
            border: 'none',
            background: '#422afb',
            color: '#ffffff',
            padding: '0.625rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          Tentar de novo
        </button>
      </body>
    </html>
  )
}
