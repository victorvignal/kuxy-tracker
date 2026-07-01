import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Preferências do app persistidas no localStorage.
 *
 * Cobre o que NÃO vai pro backend (theme, accent override, toggles de
 * notificação, hora do reminder). Coisas que precisam de IPC ficam nos
 * stores próprios (useProfile, etc).
 *
 * Separação deliberada:
 *   - Tema/accent → visual, deve refletir instantâneo (sidebar, buttons)
 *   - Notif toggles + reminder time → behavioral, lidos pelo notification
 *     scheduler quando existir (ainda não implementado)
 *   - Resto (idioma) → já tem useLangStore; deixamos pra evitar
 *     duplicar source-of-truth
 */

export type AccentColor =
  | 'violet' // default
  | 'blue'
  | 'green'
  | 'amber'
  | 'pink'

interface SettingsState {
  accent: AccentColor
  /** "dark" hoje; "light" existe nos tokens mas pode estar bugado em algum lugar. */
  themePref: 'dark' | 'light'
  notifyDailyReminder: boolean
  notifyStreakWarning: boolean
  notifyWeeklyReport: boolean
  reminderTime: string // HH:MM
  setAccent: (c: AccentColor) => void
  setThemePref: (t: 'dark' | 'light') => void
  setNotifyDailyReminder: (v: boolean) => void
  setNotifyStreakWarning: (v: boolean) => void
  setNotifyWeeklyReport: (v: boolean) => void
  setReminderTime: (v: string) => void
}

/**
 * Map de accent → CSS var override. Aplicado em runtime injetando
 * um <style> com --color-accent* que sobrescreve o do ThemeProvider.
 *
 * Mantemos só 5 cores por enquanto. Adicionar nova = somar entry aqui.
 */
export const ACCENT_VARS: Record<AccentColor, Record<string, string>> = {
  violet: {
    '--color-accent': '#8b5cf6',
    '--color-accent-hover': '#7c3aed',
    '--color-accent-soft': 'rgba(139, 92, 246, 0.12)',
    '--color-accent-light': '#a78bfa',
    '--color-accent-dark': '#6d4ee0',
    '--color-chart-primary': '#8b5cf6',
    '--color-chart-secondary': '#a78bfa',
    '--color-chart-tertiary': '#6d4ee0',
    '--color-chart-quaternary': '#4f4193'
  },
  blue: {
    '--color-accent': '#3b82f6',
    '--color-accent-hover': '#2563eb',
    '--color-accent-soft': 'rgba(59, 130, 246, 0.12)',
    '--color-accent-light': '#60a5fa',
    '--color-accent-dark': '#1d4ed8',
    '--color-chart-primary': '#3b82f6',
    '--color-chart-secondary': '#60a5fa',
    '--color-chart-tertiary': '#1d4ed8',
    '--color-chart-quaternary': '#1e3a8a'
  },
  green: {
    '--color-accent': '#22c55e',
    '--color-accent-hover': '#16a34a',
    '--color-accent-soft': 'rgba(34, 197, 94, 0.12)',
    '--color-accent-light': '#4ade80',
    '--color-accent-dark': '#15803d',
    '--color-chart-primary': '#22c55e',
    '--color-chart-secondary': '#4ade80',
    '--color-chart-tertiary': '#15803d',
    '--color-chart-quaternary': '#14532d'
  },
  amber: {
    '--color-accent': '#f59e0b',
    '--color-accent-hover': '#d97706',
    '--color-accent-soft': 'rgba(245, 158, 11, 0.12)',
    '--color-accent-light': '#fbbf24',
    '--color-accent-dark': '#b45309',
    '--color-chart-primary': '#f59e0b',
    '--color-chart-secondary': '#fbbf24',
    '--color-chart-tertiary': '#b45309',
    '--color-chart-quaternary': '#78350f'
  },
  pink: {
    '--color-accent': '#ec4899',
    '--color-accent-hover': '#db2777',
    '--color-accent-soft': 'rgba(236, 72, 153, 0.12)',
    '--color-accent-light': '#f472b6',
    '--color-accent-dark': '#be185d',
    '--color-chart-primary': '#ec4899',
    '--color-chart-secondary': '#f472b6',
    '--color-chart-tertiary': '#be185d',
    '--color-chart-quaternary': '#831843'
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      accent: 'violet',
      themePref: 'dark',
      notifyDailyReminder: true,
      notifyStreakWarning: true,
      notifyWeeklyReport: true,
      reminderTime: '09:00',
      setAccent: (c) => set({ accent: c }),
      setThemePref: (t) => set({ themePref: t }),
      setNotifyDailyReminder: (v) => set({ notifyDailyReminder: v }),
      setNotifyStreakWarning: (v) => set({ notifyStreakWarning: v }),
      setNotifyWeeklyReport: (v) => set({ notifyWeeklyReport: v }),
      setReminderTime: (v) => set({ reminderTime: v })
    }),
    {
      name: 'kuxy.settings',
      partialize: (s) => ({
        accent: s.accent,
        themePref: s.themePref,
        notifyDailyReminder: s.notifyDailyReminder,
        notifyStreakWarning: s.notifyStreakWarning,
        notifyWeeklyReport: s.notifyWeeklyReport,
        reminderTime: s.reminderTime
      })
    }
  )
)