/** Gráfico de barras em SVG puro (sem dependências). */
export function BarChart({
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
  const gap = 14
  const max = Math.max(...data, 1)
  const barWidth = (width - pad * 2 - gap * (data.length - 1)) / data.length
  const chartH = height - pad * 2

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      style={{ width: '100%', height }}
      role="img"
      aria-label="Gráfico de barras"
    >
      {data.map((value, i) => {
        const h = (value / max) * chartH
        const x = pad + i * (barWidth + gap)
        const y = height - pad - h
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={h}
            rx="6"
            fill="var(--color-brand-500)"
          />
        )
      })}
    </svg>
  )
}
