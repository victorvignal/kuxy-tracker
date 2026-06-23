/**
 * Design tokens do KUXY.
 *
 * SINGLE SOURCE OF TRUTH pra toda decisão visual. Tudo no Tailwind, nos
 * components e no CSS custom properties vem daqui. Mudou aqui, mudou em
 * todo o app. Sem isso, paleta vira um Frankenstein de hex hardcoded
 * espalhado em 15 arquivos.
 *
 * Como funciona:
 *   - tailwind.config.js consome este arquivo via build-time import
 *   - index.css injeta :root com CSS variables pra casos onde o Tailwind
 *     não chega (recharts, lucide-react com stroke customizado, etc.)
 *   - Componentes nunca referenciam hex diretamente — sempre classe
 *     semântica (bg-surface, text-muted, border-strong, etc.)
 *
 * Pra criar um tema novo (light mode, cores diferentes, etc):
 *   1. Cria um novo objeto Theme em themes/
 *   2. Exporta em THEMES
 *   3. Troca o default em <ThemeProvider>
 *   Funcionalidade não toca.
 */

export type Theme = {
  name: string
  colors: {
    // surfaces
    bg: string
    bgSubtle: string
    bgCard: string
    bgHover: string
    // borders
    border: string
    borderStrong: string
    // text
    text: string
    textMuted: string
    textSubtle: string
    // brand
    accent: string
    accentHover: string
    accentSoft: string // rgba/alpha pra fundos sutis
    accentLight: string // tom claro do accent (pra gradient em chart)
    accentDark: string // tom escuro do accent
    // status
    success: string
    danger: string
    warning: string
    info: string
    // chart palette (alinhada com template Tempo)
    chartPrimary: string
    chartSecondary: string
    chartTertiary: string
    chartQuaternary: string
    // misc
    scrim: string // fundo de modais
  }
  radii: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  type: {
    // Sizes 1:1 do template Pessoal Dashboard.
    // Classes Tailwind customizadas (text-tmpl-xl etc) são definidas em tailwind.config.js
    // e mapeiam pra estes tokens via CSS vars.
    titleLg: string // 18px / 700 / -.01em
    titleMd: string // 16px / 700
    titleSm: string // 15px / 600
    body: string // 13.5px / 500
    bodySmall: string // 13px / 500
    label: string // 12.5px / 600
    labelXs: string // 12px / 500
    micro: string // 11px / 600
    microXs: string // 10.5px / 600
    // Big numbers (stat cards, total balance)
    statValue: string // 30px / 700 / -.02em
    statTotal: string // 34px / 700 / -.02em
  }
  spacing: {
    sidebarWidth: string
    topbarHeight: string
  }
  font: {
    sans: string
    mono: string
  }
  shadow: {
    card: string
    pop: string
  }
}

// Tema dark (default). Réplica 1:1 do template Pessoal Dashboard
// (C:\Users\vigna\Downloads\design).
export const DARK: Theme = {
  name: 'dark',
  colors: {
    bg: '#0a0a0b',
    bgSubtle: '#0c0c0e',
    bgCard: '#141416',
    bgHover: '#1a1a1e',
    border: '#1f1f22',
    borderStrong: '#2a2a2e',
    text: '#e8e8ea',
    textMuted: '#86868d',
    textSubtle: '#5e5e5e',
    accent: '#8b5cf6',
    accentHover: '#7c3aed',
    accentSoft: 'rgba(139, 92, 246, 0.12)',
    accentLight: '#a78bfa',
    accentDark: '#6d4ee0',
    success: '#4ade80',
    danger: '#f87171',
    warning: '#facc15',
    info: '#22d3ee',
    chartPrimary: '#8b5cf6',
    chartSecondary: '#a78bfa',
    chartTertiary: '#6d4ee0',
    chartQuaternary: '#4f4193',
    scrim: 'rgba(0, 0, 0, 0.6)'
  },
  radii: {
    sm: '8px',
    md: '10px',
    lg: '13px',
    xl: '16px'
  },
  type: {
    titleLg: '18px',
    titleMd: '16px',
    titleSm: '15px',
    body: '13.5px',
    bodySmall: '13px',
    label: '12.5px',
    labelXs: '12px',
    micro: '11px',
    microXs: '10.5px',
    statValue: '30px',
    statTotal: '34px'
  },
  spacing: {
    sidebarWidth: '252px',
    topbarHeight: '56px'
  },
  font: {
    sans: '"Inter", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace'
  },
  shadow: {
    card: '0 1px 0 0 rgba(255, 255, 255, 0.02) inset, 0 0 0 1px rgba(255, 255, 255, 0.05)',
    pop: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)'
  }
}

// Tema light — alinhado com a mesma paleta, em tons claros.
export const LIGHT: Theme = {
  name: 'light',
  colors: {
    bg: '#fafafb',
    bgSubtle: '#f3f3f7',
    bgCard: '#ffffff',
    bgHover: '#ececf2',
    border: '#e5e5ec',
    borderStrong: '#d0d0db',
    text: '#1a1a22',
    textMuted: '#6b6b78',
    textSubtle: '#9b9ba6',
    accent: '#7c3aed',
    accentHover: '#6d28d9',
    accentSoft: 'rgba(124, 58, 237, 0.10)',
    accentLight: '#a78bfa',
    accentDark: '#5b21b6',
    success: '#16a34a',
    danger: '#dc2626',
    warning: '#d97706',
    info: '#0891b2',
    chartPrimary: '#7c3aed',
    chartSecondary: '#a78bfa',
    chartTertiary: '#5b21b6',
    chartQuaternary: '#4c1d95',
    scrim: 'rgba(0, 0, 0, 0.35)'
  },
  radii: DARK.radii,
  spacing: DARK.spacing,
  font: DARK.font,
  type: DARK.type,
  shadow: {
    card: '0 0 0 1px rgba(0, 0, 0, 0.04)',
    pop: '0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06)'
  }
}

export const THEMES = {
  dark: DARK,
  light: LIGHT
} as const

export type ThemeName = keyof typeof THEMES

export const DEFAULT_THEME: ThemeName = 'dark'

/**
 * Gera o conteúdo do :root em CSS. Cada token vira uma variável
 * `--color-bg`, `--color-accent`, etc.
 *
 * Isso permite que CSS inline (recharts, transitions, keyframes)
 * acesse os tokens via var(--color-bg) sem precisar importar TS.
 */
export function tokensToCss(theme: Theme): string {
  const lines: string[] = []
  for (const [k, v] of Object.entries(theme.colors)) {
    lines.push(`--color-${k}: ${v};`)
  }
  for (const [k, v] of Object.entries(theme.radii)) {
    lines.push(`--radius-${k}: ${v};`)
  }
  lines.push(`--sidebar-width: ${theme.spacing.sidebarWidth};`)
  lines.push(`--topbar-height: ${theme.spacing.topbarHeight};`)
  lines.push(`--font-sans: ${theme.font.sans};`)
  lines.push(`--font-mono: ${theme.font.mono};`)
  lines.push(`--shadow-card: ${theme.shadow.card};`)
  lines.push(`--shadow-pop: ${theme.shadow.pop};`)
  return `:root {\n  ${lines.join('\n  ')}\n}\n`
}

/** Acessa um token em runtime (use em canvas, gradient inline, etc.). */
export function token<K extends keyof Theme['colors']>(theme: Theme, key: K): string {
  return theme.colors[key]
}