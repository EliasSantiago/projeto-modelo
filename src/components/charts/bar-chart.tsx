'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useId, useState } from 'react'
import { useMeasure } from '@/hooks/use-measure'
import { cn } from '@/lib/utils'

/** Caminho de um retângulo com apenas os cantos superiores arredondados. */
function topRoundedBar(x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.max(Math.min(r, w / 2, h), 0)
  return `M ${x},${y + h} L ${x},${y + radius} Q ${x},${y} ${x + radius},${y} L ${x + w - radius},${y} Q ${x + w},${y} ${x + w},${y + radius} L ${x + w},${y + h} Z`
}

/**
 * Gráfico de barras premium em SVG (sem libs de chart). Barras crescem com
 * animação escalonada, cantos superiores arredondados, gradiente e tooltip
 * no hover. Cores via `currentColor` (adaptam ao tema).
 */
export function BarChart({
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

  const padX = 6
  const padTop = 18
  const padBottom = 24
  const innerW = Math.max(width - padX * 2, 0)
  const innerH = height - padTop - padBottom
  const bottom = height - padBottom

  const max = Math.max(...data, 1)
  const gap = data.length > 1 ? Math.min(18, innerW * 0.04) : 0
  const barW = (innerW - gap * (data.length - 1)) / data.length

  const gridYs = [0, 0.5, 1].map((t) => padTop + innerH * t)

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
          aria-label="Gráfico de barras"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.45" />
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

          {data.map((value, i) => {
            const h = (value / max) * innerH
            const x = padX + i * (barW + gap)
            const y = bottom - h
            const isActive = active === i
            return (
              <g
                key={i}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
              >
                {/* Área de hover (barra inteira até o topo) */}
                <rect
                  x={x}
                  y={padTop}
                  width={barW}
                  height={innerH}
                  fill="transparent"
                />
                <motion.path
                  d={topRoundedBar(x, y, barW, h, Math.min(8, barW / 2))}
                  fill={`url(#${gradientId})`}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: isActive ? 1 : 0.85 }}
                  transition={{
                    scaleY: {
                      delay: i * 0.06,
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    opacity: { duration: 0.2 },
                  }}
                  style={{
                    transformBox: 'fill-box',
                    transformOrigin: 'bottom',
                  }}
                />
              </g>
            )
          })}
        </svg>
      )}

      {/* Rótulos do eixo X */}
      {labels && width > 0 && (
        <div className="text-navy-400 pointer-events-none absolute right-0 bottom-0 left-0 flex px-[6px] text-[11px]">
          {labels.map((label, i) => (
            <span
              key={i}
              className={cn(
                'text-center transition-colors',
                active === i && 'text-brand-500 font-semibold dark:text-white',
              )}
              style={{ width: barW, marginLeft: i === 0 ? 0 : gap }}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {active !== null && width > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 shadow-lg"
            style={{
              left: padX + active * (barW + gap) + barW / 2,
              top: bottom - (data[active]! / max) * innerH - 10,
            }}
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
