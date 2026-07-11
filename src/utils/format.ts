/**
 * Funções puras, sem dependência de framework, testáveis isoladamente.
 */

/** Formata uma data para pt-BR (ex.: "04/07/2026"). */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

/** Trunca um texto adicionando reticências. */
export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`
}
