/**
 * @type {import('tailwindcss').Config}
 *
 * IMPORTANTE: os valores aqui DEVEM bater com src/renderer/src/design/tokens.ts.
 * Tailwind não importa TS direto em runtime, então duplicamos. Mudou um tema,
 * mudou os dois arquivos (e o fallback em index.css).
 *
 * Pra criar tema novo: muda o tokens.ts, atualiza aqui, atualiza o :root no index.css.
 * Ou troca pra uma config Tailwind que consome o TS via plugin (próximo passo se
 * virar bagunça).
 */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--color-bg)',
          subtle: 'var(--color-bg-subtle)',
          card: 'var(--color-bg-card)',
          hover: 'var(--color-bg-hover)'
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)'
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          subtle: 'var(--color-text-subtle)'
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          soft: 'var(--color-accent-soft)'
        },
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)'
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)'
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)'
      },
      width: {
        sidebar: 'var(--sidebar-width)'
      },
      height: {
        topbar: 'var(--topbar-height)'
      },
      // Typography tokens do template Pessoal Dashboard.
      // Font-sizes 1:1; weight/letter-spacing aplicados juntos pra evitar esquecer.
      fontSize: {
        tmpl: {
          // Sidebar / Topbar
          sidebar: ['14px', { lineHeight: 'normal', fontWeight: '500' }],
          profile: ['19px', { lineHeight: 'normal', fontWeight: '700', letterSpacing: '-0.01em' }],
          'page-title': ['17px', { lineHeight: 'normal', fontWeight: '600', letterSpacing: '-0.01em' }],
          // Card titles (Balance Flow, Spending Breakdown, etc)
          'card-title': ['15px', { lineHeight: 'normal', fontWeight: '600' }],
          // Body / form
          body: ['14px', { lineHeight: 'normal', fontWeight: '500' }],
          'body-sm': ['13.5px', { lineHeight: 'normal', fontWeight: '500' }],
          'body-xs': ['13px', { lineHeight: 'normal', fontWeight: '500' }],
          // Stat values
          stat: ['22px', { lineHeight: 'normal', fontWeight: '700' }],
          revenue: ['27px', { lineHeight: 'normal', fontWeight: '700', letterSpacing: '-0.01em' }],
          // Labels
          label: ['13px', { lineHeight: 'normal', fontWeight: '500' }],
          'label-sm': ['12px', { lineHeight: 'normal', fontWeight: '500' }],
          'label-xs': ['11px', { lineHeight: 'normal', fontWeight: '500' }],
          // Insight / sub-text
          insight: ['11.5px', { lineHeight: '1.5', fontWeight: '500' }],
          // Donut
          donut: ['21px', { lineHeight: 'normal', fontWeight: '700' }],
          'donut-label': ['9px', { lineHeight: 'normal', fontWeight: '500' }],
          // Tabela
          table: ['13px', { lineHeight: 'normal', fontWeight: '500' }],
          'table-header': ['12px', { lineHeight: 'normal', fontWeight: '500' }],
          badge: ['11.5px', { lineHeight: 'normal', fontWeight: '500' }],
          // Micro
          micro: ['11px', { lineHeight: 'normal', fontWeight: '500' }]
        }
      }
    }
  },
  plugins: []
}