import { useEffect } from 'react'
import { useSettingsStore, ACCENT_VARS } from '../../store/useSettings'

/**
 * Injeta CSS variables de accent override no :root.
 *
 * O ThemeProvider injeta o accent default do theme (roxo).
 * Se o user escolheu outro accent no Settings, sobrescrevemos
 * aqui com !important via specificity (style tag > theme's <style>).
 *
 * Mantém só os vars de accent + chart — o resto do tema fica
 * intacto pra não brigar com theme dark/light.
 */
export function AccentProvider({ children }: { children: React.ReactNode }) {
  const accent = useSettingsStore((s) => s.accent)

  useEffect(() => {
    const styleId = 'kuxy-accent-vars'
    let el = document.getElementById(styleId) as HTMLStyleElement | null
    if (!el) {
      el = document.createElement('style')
      el.id = styleId
      document.head.appendChild(el)
    }
    const vars = ACCENT_VARS[accent]
    // !important pra ganhar do ThemeProvider's :root injection
    const lines = Object.entries(vars)
      .map(([k, v]) => `${k}: ${v} !important;`)
      .join('\n')
    el.textContent = `:root {\n${lines}\n}`
  }, [accent])

  return <>{children}</>
}