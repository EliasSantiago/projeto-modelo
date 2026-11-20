import type { SVGProps } from 'react'

/** Ícone de painel lateral (recolher/expandir o menu), traço outline 1.5. */
export function PanelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-slot="icon"
      {...props}
    >
      <rect x="3.25" y="4.25" width="17.5" height="15.5" rx="3.25" />
      <path d="M9.25 4.5v15M5.75 8h1.25M5.75 11h1.25" />
    </svg>
  )
}
