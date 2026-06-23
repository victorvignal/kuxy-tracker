import React from 'react'

/**
 * Ícones SVG extraídos 1:1 do template Pessoal Dashboard
 * (C:\Users\vigna\Downloads\design\Dashboard.dc.html e ICONS_DETAILED.html).
 *
 * Substituem lucide-react em todas as surfaces que vieram do template:
 * sidebar, topbar, dashboard, stat cards, balance flow, spending breakdown, table.
 *
 * Todos aceitam `size` (px), `color` (qualquer valor CSS de cor), `strokeWidth`,
 * e props SVG padrão (className, etc).
 */

type Props = React.SVGProps<SVGSVGElement> & {
  size?: number | string
  color?: string
  strokeWidth?: number
}

const stroke = (p: Props, override?: number) => ({
  width: p.size ?? 17,
  height: p.size ?? 17,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: p.color ?? 'currentColor',
  strokeWidth: override ?? p.strokeWidth ?? 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...p
})

// ─── Brand / Lightning (filled) ──────────────────────────────────────────
export const BrandLogo = ({ size = 17, color = 'var(--color-accent)', ...rest }: Props) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" {...rest}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

// ─── Sidebar Main Menu ───────────────────────────────────────────────────
export const IconDashboard = (p: Props) => <svg {...stroke(p)}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>

export const IconNotification = (p: Props) => <svg {...stroke(p)}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>

export const IconEarnings = (p: Props) => <svg {...stroke(p)}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>

export const IconSpending = (p: Props) => <svg {...stroke(p)}><rect x="2" y="5" width="20" height="14" rx="2" /><rect x="5" y="11" width="5" height="4" rx="1" /></svg>

export const IconSubscriptions = (p: Props) => <svg {...stroke(p)}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>

export const IconReports = (p: Props) => <svg {...stroke(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>

export const IconTransactions = (p: Props) => <svg {...stroke(p)}><line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" /></svg>

export const IconPerformance = (p: Props) => <svg {...stroke(p)}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>

export const IconMoreDots = ({ size = 17, color = 'currentColor', ...rest }: Props) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" {...rest}>
    <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
  </svg>
)

// ─── Sidebar General ─────────────────────────────────────────────────────
export const IconSettings = (p: Props) => <svg {...stroke(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>

export const IconHelp = (p: Props) => <svg {...stroke(p)}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>

export const IconFeedback = (p: Props) => <svg {...stroke(p)}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>

// ─── Chevrons ────────────────────────────────────────────────────────────
export const ChevronDown = (p: Props) => <svg {...stroke(p)}><polyline points="6 9 12 15 18 9" /></svg>
export const ChevronUp = (p: Props) => <svg {...stroke(p)}><polyline points="18 15 12 9 6 15" /></svg>
export const ChevronDoubleDown = (p: Props) => <svg {...stroke(p)}><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
export const ChevronLeft = (p: Props) => <svg {...stroke(p)}><polyline points="15 18 9 12 15 6" /></svg>
export const ChevronRight = (p: Props) => <svg {...stroke(p)}><polyline points="9 18 15 12 9 6" /></svg>
export const ArrowRight = (p: Props) => <svg {...stroke(p)}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>

// ─── Topbar / Search / Add / Invite / Export ────────────────────────────
export const IconSearch = (p: Props) => <svg {...stroke(p)}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>

export const IconPlus = (p: Props) => <svg {...stroke(p, 2.2)}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>

export const IconInvite = (p: Props) => <svg {...stroke(p)}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>

export const IconExport = (p: Props) => <svg {...stroke(p)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>

// ─── Stat card icons ─────────────────────────────────────────────────────
export const IconBalance = (p: Props) => <svg {...stroke(p)}><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" /><path d="M4 6v12c0 1.1.9 2 2 2h14v-4" /><path d="M18 12a2 2 0 0 0 0 4h4v-4z" /></svg>

export const IconSavings = (p: Props) => <svg {...stroke(p)}><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01" /><path d="M18 12h.01" /></svg>

export const IconTrendUp = (p: Props) => <svg {...stroke(p)}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>

export const IconReceipt = (p: Props) => <svg {...stroke(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" /></svg>

// ─── Card section headers (Balance Flow + Spending Breakdown) ───────────
export const IconTrendUpAccent = (p: Props) => <svg {...stroke(p, p.strokeWidth)} stroke="var(--color-accent-light)"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>

export const IconGridAccent = (p: Props) => <svg {...stroke(p, p.strokeWidth)} stroke="var(--color-accent-light)"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>