'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useId, useState } from 'react'
import { useMeasure } from '@/hooks/use-measure'
import { cn } from '@/lib/utils'

type Point = readonly [number, number]

/** Curva suave (Catmull-Rom convertido em Bézier cúbica) entre os pontos. */
function smoothPath(points: Point[]): string {
  const first = points[0]
  if (!first) return ''
  if (points.length < 2) return `M ${first[0]},${first[1]}`
  const d = [`M ${first[0]},${first[1]}`]
  const k = 0.18
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]!
    const p2 = points[i + 1]!
    const p0 = points[i - 1] ?? p1
    const p3 = points[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) * k
    const c1y = p1[1] + (p2[1] - p0[1]) * k
    const c2x = p2[0] - (p3[0] - p1[0]) * k
    const c2y = p2[1] - (p3[1] - p1[1]) * k
    d.push(`C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`)
  }
  return d.join(' ')
}

/**
 * Gráfico de área premium em SVG (sem libs de chart). Animação de entrada
 * (linha se desenhando + área surgindo), pontos e tooltip no hover. As cores
 * usam `currentColor`, então adaptam ao tema (grafite no claro, branco no
 * escuro). Troque pelos dados reais quando necessário.
 */
export function AreaChart({
  data,
  labels,
  height = 260,
  prefix = '',
  suffix = '',
  className,
}: {
  data: number[]
  labels?: string[]
  height?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const { ref, width } = useMeasure<HTMLDivElement>()
  const gradientId = useId()
  const [active, setActive] = useState<number | null>(null)

  const padX = 14
  const padTop = 18
  const padBottom = 24
  const innerW = Math.max(width - padX * 2, 0)
  const innerH = height - padTop - padBottom
  const bottom = height - padBottom

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points: Point[] = data.map((value, i) => {
    const x = padX + (innerW * i) / (data.length - 1 || 1)
    const y = padTop + innerH - ((value - min) / range) * innerH
    return [x, y]
  })

  const line = smoothPath(points)
  const first = points[0]
  const last = points[points.length - 1]
  const area =
    first && last && points.length > 1
      ? `${line} L ${last[0]},${bottom} L ${first[0]},${bottom} Z`
      : ''

  const gridYs = [0, 0.5, 1].map((t) => padTop + innerH * t)

  function handleMove(event: React.PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const ratio = (x - padX) / (innerW || 1)
    const idx = Math.round(ratio * (data.length - 1))
    setActive(Math.min(Math.max(idx, 0), data.length - 1))
  }

  const activePoint = active !== null ? points[active] : null

  return (
    <div
      ref={ref}
      className={cn(
        'text-brand-500 relative w-full select-none dark:text-white',
        className,
      )}
      style={{ height }}
    >
      {width > 0 && (
        <svg
          width={width}
          height={height}
          className="overflow-visible"
          role="img"
          aria-label="Gráfico de área"
          onPointerMove={handleMove}
          onPointerLeave={() => setActive(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid horizontal sutil */}
          {gridYs.map((y, i) => (
            <line
              key={i}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="var(--color-border)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
          ))}

          {/* Área */}
          <motion.path
            d={area}
            fill={`url(#${gradientId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          />

          {/* Linha se desenhando */}
          <motion.path
            d={line}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
          />

          {/* Guia + destaque no ponto ativo */}
          {activePoint && (
            <g>
              <line
                x1={activePoint[0]}
                x2={activePoint[0]}
                y1={padTop - 6}
                y2={bottom}
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeWidth="1.5"
              />
              <circle
                cx={activePoint[0]}
                cy={activePoint[1]}
                r="9"
                fill="currentColor"
                fillOpacity="0.12"
              />
              <circle
                cx={activePoint[0]}
                cy={activePoint[1]}
                r="4.5"
                fill="var(--color-card)"
                stroke="currentColor"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* Pontos surgindo após a linha */}
          {points.map(([x, y], i) => (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="2.5"
              fill="currentColor"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: active === i ? 0 : 1, opacity: 1 }}
              transition={{ delay: 0.9 + i * 0.04, duration: 0.3 }}
            />
          ))}
        </svg>
      )}

      {/* Rótulos do eixo X */}
      {labels && width > 0 && (
        <div className="text-navy-400 pointer-events-none absolute right-0 bottom-0 left-0 flex justify-between px-[14px] text-[11px]">
          {labels.map((label, i) => (
            <span
              key={i}
              className={cn(
                'transition-colors',
                active === i && 'text-brand-500 font-semibold dark:text-white',
              )}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {activePoint && active !== null && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 shadow-lg"
            style={{ left: activePoint[0], top: activePoint[1] - 12 }}
          >
            {labels?.[active] && (
              <p className="text-navy-400 text-[11px] leading-none">
                {labels[active]}
              </p>
            )}
            <p className="text-navy-700 mt-1 text-sm font-bold dark:text-white">
              {`${prefix}${data[active]}${suffix}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
