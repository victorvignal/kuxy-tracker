// KUXY i18n — split into JSON locale files (v0.12 refactor)
// API mantida identica: useLangStore, useT(), tFor()
// Mudanca: chaves antes inline em 1089 linhas, agora em locales/{lang}.json

import { create } from 'zustand'
import enDict from '../locales/en.json'
import ptBRDict from '../locales/pt-BR.json'

export type Lang = 'en' | 'pt-BR'

const dicts: Record<Lang, Record<string, string>> = {
  'en': enDict as Record<string, string>,
  'pt-BR': ptBRDict as Record<string, string>,
}

interface LangState {
  lang: Lang
  setLang: (l: Lang) => void
}

const STORAGE_KEY = 'kuxy.lang'

const initialLang: Lang = (() => {
  if (typeof localStorage === 'undefined') return 'en'
  const saved = localStorage.getItem(STORAGE_KEY) as Lang | null
  if (saved === 'en' || saved === 'pt-BR') return saved
  // detect from browser
  const browser = typeof navigator !== 'undefined' ? navigator.language : 'en'
  return browser?.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en'
})()

export const useLangStore = create<LangState>((set) => ({
  lang: initialLang,
  setLang: (lang) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang)
    }
    set({ lang })
  }
}))

export function tFor(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  let template = dicts[lang]?.[key] ?? dicts.en[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
  }
  return template
}

export function useT() {
  const lang = useLangStore((s) => s.lang)
  return (key: string, vars?: Record<string, string | number>) => tFor(lang, key, vars)
}
