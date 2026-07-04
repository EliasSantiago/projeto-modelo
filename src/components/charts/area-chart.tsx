/**
 * Gráfico de área em SVG puro (sem dependências). Ideal para boilerplate —
 * troque pelos dados reais quando necessário.
 */
export function AreaChart({
  data,
  height = 240,
  className,
}: {
  data: number[]
  height?: number
  className?: string
}) {
  const width = 600
  const pad = 8
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  const points = data.map((value, i) => {
    const x = pad + (i * (width - pad * 2)) / (data.length - 1 || 1)
    const y = height - pad - ((value - min) / range) * (height - pad * 2)
    return [x, y] as const
  })

  const line = points.map(([x, y]) => `${x},${y}`).join(' ')
  const area = `${pad},${height - pad} ${line} ${width - pad},${height - pad}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      style={{ width: '100%', height }}
      role="img"
      aria-label="Gráfico de área"
    >
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="var(--color-brand-400)"
            stopOpacity="0.35"
          />
          <stop
            offset="100%"
            stopColor="var(--color-brand-400)"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#areaFill)" />
      <polyline
        points={line}
        fill="none"
        stroke="var(--color-brand-500)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
