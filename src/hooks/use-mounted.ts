'use client'

import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/**
 * `false` no servidor e no primeiro render; `true` após a hidratação.
 * Usa `useSyncExternalStore` (em vez de setState em efeito), hidratação
 * segura e sem cascata de renders.
 */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}
