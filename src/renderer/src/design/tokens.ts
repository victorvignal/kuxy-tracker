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
    bgCardAlt: string
    bgRow: string
    bgHover: string
    bgBtn: string
    bgBtnAlt: string
    bgInput: string
    bgChip: string
    // borders
    border: string
    borderSoft: string
    borderMed: string
    borderStrong: string
    borderHard: string
    borderFaint: string
    borderRow: string
    borderDot: string
    borderDotAlt: string
    borderChip: string
    // text
    text: string
    textBright: string
    textVivid: string
    textMuted: string
    textMuted2: string
    textSubtle: string
    textSubtle2: string
    textDim: string
    // brand
    accent: string
    accentHover: string
    accentSoft: string
    accentLight: string
    accentDark: string
    accentLine: string // barra vertical de item ativo na sidebar (BRANCA no dark)
    // status
    success: string
    danger: string
    warning: string
    info: string
    // trial + user-specific
    trialZap: string
    trialProgress: string
    userAvatar: string
    userAvatarDark: string
    // chart palette (alinhada com template Tempo)
    chartPrimary: string
    chartSecondary: string
    chartTertiary: string
    chartQuaternary: string
    // misc
    scrim: string
  }
  radii: {
    sm: string
    md: string
    lg: string
    xl: string
    '2xl'?: string
  }
  type: {
    sidebarItem: string // 14px
    profileName: string // 19px
    pageTitle: string // 17px
    cardTitle: string // 15px
    sectionTitle: string // 13px
    body: string // 14px
    bodySm: string // 13.5px
    bodyXs: string // 13px
    statValue: string // 22px
    statLabel: string // 13px
    revenueTotal: string // 27px
    insight: string // 11.5px
    labelSm: string // 13px
    label: string // 12px
    labelXs: string // 11px
    tableHeader: string // 12px
    tableBody: string // 13px
    badge: string // 11.5px
    donutLabel: string // 9px
    donutValue: string // 21px
    micro: string // 11px
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
// (C:\Users\vigna\Downloads\design\Tempo Dashboard.dc.html — direção "Noite"
// do estudo Kibo Direções).
//
// Cores extraídas HEX-by-HEX do HTML. Cada nome corresponde ao uso no template:
//   bgCard         = card bg
//   bgCardAlt      = inner panel dentro de card (ex: insight sub-card)
//   bgRow          = row hover da tabela
//   borderSoft     = borda de card/header mais comum
//   borderMed      = borda de input/button
//   borderStrong   = borda de checkbox dot
//   text           = texto principal branco
//   textBright     = texto super branco (valores em destaque)
//   textMuted      = labels secundárias
//   textMuted2     = valores secundários (tabela, badges)
//   textSubtle     = labels terciárias (placeholder, sub-texto)
//   textSubtle2    = timestamp/timestamp muito sutil
//   textDim        = cor do ícone quando item está inativo na sidebar
//   accentLine     = barra vertical de item ativo na sidebar (BRANCA, não roxa)
//   trialZap       = ícone zap dentro do trial card (azul claro)
//   trialProgress  = barra de progresso do trial (cinza)
//   userAvatar     = gradiente do avatar do user button (azul)
export const DARK: Theme = {
  name: 'dark',
  colors: {
    // Backgrounds
    bg: '#0a0a0b',
    bgSubtle: '#0c0c0e',
    bgCard: '#141416',
    bgCardAlt: '#1b1b1e',
    bgRow: '#131315',
    bgHover: '#1a1a1d',
    bgBtn: '#161619',
    bgBtnAlt: '#101012',
    bgInput: '#121214',
    bgChip: '#202024',

    // Borders
    border: '#1f1f22',
    borderSoft: '#1b1b1e',
    borderMed: '#232327',
    borderStrong: '#2a2a2e',
    borderHard: '#26262a',
    borderFaint: '#161618',
    borderRow: '#1d1d20',
    borderDot: '#3a3a3e',
    borderDotAlt: '#3a3a40',
    borderChip: '#2e2e32',

    // Texts
    text: '#e8e8ea',
    textBright: '#f4f4f6',
    textVivid: '#f0f0f2',
    textMuted: '#86868d',
    textMuted2: '#9a9aa0',
    textSubtle: '#7a7a80',
    textSubtle2: '#6a6a70',
    textDim: '#5b5b62',

    // Accent + status
    accent: '#8b5cf6',
    accentHover: '#7c3aed',
    accentSoft: 'rgba(139, 92, 246, 0.12)',
    accentLight: '#a78bfa',
    accentDark: '#6d4ee0',
    accentLine: '#c9c9cf', // ← barra vertical de item ativo na sidebar (BRANCA)
    success: '#4ade80',
    danger: '#f87171',
    warning: '#facc15',
    info: '#22d3ee',

    // Trial card específico
    trialZap: '#cbd5e1',
    trialProgress: '#6b6b72',

    // User button avatar (gradient azul escuro)
    userAvatar: '#5b6b8c',
    userAvatarDark: '#2c3447',

    // Chart palette
    chartPrimary: '#8b5cf6',
    chartSecondary: '#a78bfa',
    chartTertiary: '#6d4ee0',
    chartQuaternary: '#4f4193',

    scrim: 'rgba(0, 0, 0, 0.6)'
  },
  radii: {
    sm: '8px',
    md: '9px',
    lg: '10px',
    xl: '13px',
    '2xl': '14px'
  },
  type: {
    // Sidebar items / body
    sidebarItem: '14px',
    // Sidebar profile switcher nome
    profileName: '19px',
    // Topbar page title
    pageTitle: '17px',
    // Card titles (Balance Flow, Spending Breakdown, etc)
    cardTitle: '15px',
    // Section sub-title (within cards)
    sectionTitle: '13px',
    // Form labels, body text
    body: '14px',
    bodySm: '13.5px',
    bodyXs: '13px',
    // Stat card value
    statValue: '22px',
    // Stat card label (Monthly Balance, etc)
    statLabel: '13px',
    // Revenue / total big number
    revenueTotal: '27px',
    // Insight sub-card text
    insight: '11.5px',
    // Tab buttons / form values
    labelSm: '13px',
    // Sub-labels
    label: '12px',
    labelXs: '11px',
    // Tabela header row
    tableHeader: '12px',
    // Tabela body / source
    tableBody: '13px',
    // Badges
    badge: '11.5px',
    // Donut center label
    donutLabel: '9px',
    donutValue: '21px',
    // Misc
    micro: '11px'
  },
  spacing: {
    sidebarWidth: '268px',
    topbarHeight: '38px'
  },
  font: {
      sans: '"Geist", "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
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
    // Backgrounds
    bg: '#fafafb',
    bgSubtle: '#f3f3f7',
    bgCard: '#ffffff',
    bgCardAlt: '#f7f7fa',
    bgRow: '#f9f9fc',
    bgHover: '#ececf2',
    bgBtn: '#f4f4f7',
    bgBtnAlt: '#f0f0f4',
    bgInput: '#ffffff',
    bgChip: '#ececf2',
    // Borders
    border: '#e5e5ec',
    borderSoft: '#ececf2',
    borderMed: '#d0d0db',
    borderStrong: '#bcbcc8',
    borderHard: '#d8d8e0',
    borderFaint: '#f0f0f4',
    borderRow: '#ececf2',
    borderDot: '#d0d0db',
    borderDotAlt: '#bcbcc8',
    borderChip: '#d8d8e0',
    // Texts
    text: '#1a1a22',
    textBright: '#0a0a0f',
    textVivid: '#1a1a22',
    textMuted: '#6b6b78',
    textMuted2: '#8b8b96',
    textSubtle: '#9b9ba6',
    textSubtle2: '#a8a8b3',
    textDim: '#bcbcc8',
    // Accent
    accent: '#7c3aed',
    accentHover: '#6d28d9',
    accentSoft: 'rgba(124, 58, 237, 0.10)',
    accentLight: '#a78bfa',
    accentDark: '#5b21b6',
    accentLine: '#7c3aed',
    success: '#16a34a',
    danger: '#dc2626',
    warning: '#d97706',
    info: '#0891b2',
    // Trial + user
    trialZap: '#5b21b6',
    trialProgress: '#7c3aed',
    userAvatar: '#5b21b6',
    userAvatarDark: '#1a1a22',
    // Charts
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
  for (const [k, v] of Object.entries(theme.type)) {
    lines.push(`--type-${k}: ${v};`)
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