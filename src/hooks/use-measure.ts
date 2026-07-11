'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Mede a largura de um elemento e reage a redimensionamentos via
 * ResizeObserver. Usado pelos gráficos para renderizar em pixels reais
 * (sem distorcer traços/pontos como `preserveAspectRatio="none"` faria).
 */
export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0]?.contentRect.width ?? 0)
    })
    observer.observe(el)
    setWidth(el.getBoundingClientRect().width)

    return () => observer.disconnect()
  }, [])

  return { ref, width }
}
