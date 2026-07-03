import { app } from 'electron'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

/**
 * YouTube Data API helpers (v0.10.0).
 *
 * API key fica em `~/.kuxy/config.json` (fora do app.asar), em plain.
 * Pra uso pessoal é OK; se virar SaaS no futuro, troca por keytar.
 *
 * Mock fallback: se não tem key OU deu erro, retorna 6 canais hardcoded
 * pra UI não quebrar no dev. O UI detecta `ok: false` e mostra aviso.
 */

const KEYWORDS_CATEGORIES: Array<{ name: string; words: string[] }> = [
  { name: 'Tech', words: ['tech', 'tecnologia', 'review', 'unbox', 'setup', 'programação', 'code', 'developer', 'dev'] },
  { name: 'Fitness', words: ['fitness', 'treino', 'academia', 'musculação', 'crossfit', 'yoga', 'pilates'] },
  { name: 'Lifestyle', words: ['lifestyle', 'rotina', 'dia a dia', 'vlog'] },
  { name: 'Gaming', words: ['game', 'gaming', 'gameplay', 'fps', 'moba', 'rpg', 'steam'] },
  { name: 'Food', words: ['food', 'comida', 'receita', 'cozinha', 'chef', 'culinária'] },
  { name: 'Travel', words: ['travel', 'viagem', 'turismo', 'mochilão', 'backpacker'] },
  { name: 'Finance', words: ['finanças', 'investimento', 'renda', 'crypto', 'bitcoin', 'bolsa'] },
  { name: 'Education', words: ['educação', 'aula', 'curso', 'estudo', 'tutorial'] }
]

/** Heurística simples: primeira categoria cujas palavras batem no texto. */
export function deriveCategory(text: string): string | null {
  const lower = text.toLowerCase()
  for (const cat of KEYWORDS_CATEGORIES) {
    if (cat.words.some((w) => lower.includes(w))) return cat.name
  }
  return null
}

/** Score 0-100: quanto as keywords do canal batem com a query do user. */
export function scoreFromKeywords(text: string, query: string): number {
  const textLower = text.toLowerCase()
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2)
  if (queryWords.length === 0) return 50
  const hits = queryWords.filter((w) => textLower.includes(w)).length
  const base = (hits / queryWords.length) * 70
  // Bonus por followers range ideal (10k-500k)
  return Math.min(100, Math.round(base + 30))
}

type Config = { youtubeApiKey?: string }

function configPath(): string {
  return join(app.getPath('userData'), '..', '..', '.kuxy', 'config.json')
}

export function getYouTubeApiKey(): string | null {
  const path = configPath()
  if (!existsSync(path)) return null
  try {
    const raw = readFileSync(path, 'utf8')
    const cfg = JSON.parse(raw) as Config
    return cfg.youtubeApiKey ?? null
  } catch {
    return null
  }
}

export function setYouTubeApiKey(key: string): void {
  const path = configPath()
  const dir = join(path, '..')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  let cfg: Config = {}
  if (existsSync(path)) {
    try { cfg = JSON.parse(readFileSync(path, 'utf8')) } catch { cfg = {} }
  }
  cfg.youtubeApiKey = key
  writeFileSync(path, JSON.stringify(cfg, null, 2), 'utf8')
}

/** Mock de 6 canais pra UI não quebrar antes da key ser configurada. */
export function mockYouTubeResults(query: string) {
  type Item = {
    externalId: string
    source: 'youtube'
    handle: string
    avatarUrl: null
    region: string
    category: string
    followers: number
    score: number
  }
  const base: Omit<Item, 'name'>[] = [
    { externalId: 'UCmock1', source: 'youtube', handle: '@marina', avatarUrl: null, region: 'BR', category: 'Lifestyle', followers: 124000, score: 92 },
    { externalId: 'UCmock2', source: 'youtube', handle: '@bruno',  avatarUrl: null, region: 'BR', category: 'Tech',      followers: 89000,  score: 88 },
    { externalId: 'UCmock3', source: 'youtube', handle: '@carla',  avatarUrl: null, region: 'BR', category: 'Fitness',   followers: 203000, score: 81 },
    { externalId: 'UCmock4', source: 'youtube', handle: '@diego',  avatarUrl: null, region: 'BR', category: 'Gaming',    followers: 456000, score: 78 },
    { externalId: 'UCmock5', source: 'youtube', handle: '@elisa',  avatarUrl: null, region: 'BR', category: 'Food',      followers: 67000,  score: 75 },
    { externalId: 'UCmock6', source: 'youtube', handle: '@felipe', avatarUrl: null, region: 'BR', category: 'Travel',    followers: 178000, score: 71 }
  ]
  return base.map((b) => ({
    ...b,
    name: `${capitalize(query || 'creator')} ${b.handle.slice(1)}`,
    score: scoreFromKeywords(query, query)
  }))
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}