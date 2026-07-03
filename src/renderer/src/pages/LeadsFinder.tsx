import { useState, useMemo, useEffect } from 'react'
import { Search, Plus, MapPin, Save, Trash2, AlertTriangle } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Btn } from '../components/ui/Btn'
import { useT } from '../lib/i18n'
import { useProfileStore } from '../store/useProfile'
import { useLeads, type Lead } from '../hooks/useLeads'

type YouTubeSearchItem = {
  externalId: string
  name: string
  handle: string | null
  avatarUrl: string | null
  region: string | null
  category: string | null
  followers: number
  score: number
}

type YouTubeSearchResult =
  | { ok: true; items: YouTubeSearchItem[] }
  | { ok: false; reason: 'no_api_key' | 'api_error' | 'network_error'; status?: number; message?: string; items?: YouTubeSearchItem[] }

/**
 * Leads Finder (v0.10.0) — busca de criadores no YouTube.
 *
 * Backend: `window.api.youtube.search` chama YouTube Data API v3 se tem
 * key configurada em ~/.kuxy/config.json. Sem key → fallback mock.
 *
 * UI mostra status da key no topo (banner amarelo se não configurada).
 * Leads achados vão pra tabela "Salvos" via `window.api.leads.create`.
 * Filtros aplicam em cima do resultado (client-side) — server só retorna
 * top 20 do YouTube.
 *
 * Score é calculado server-side (scoreFromKeywords). Email/notes editáveis
 * no dialog — YouTube API não expõe email, então preenchimento manual.
 */

type SizeFilter = 'all' | 'micro' | 'mid' | 'macro'
type RegionFilter = 'all' | 'BR' | 'US' | 'EU'

export function LeadsFinder() {
  const t = useT()
  const active = useProfileStore((s) => s.getActive())
  const { leads, loading: leadsLoading, create, update, remove } = useLeads()

  const [query, setQuery] = useState('')
  const [size, setSize] = useState<SizeFilter>('all')
  const [region, setRegion] = useState<RegionFilter>('BR')
  const [searching, setSearching] = useState(false)
  const [hasKey, setHasKey] = useState<boolean | null>(null)
  const [searchResult, setSearchResult] = useState<YouTubeSearchResult | null>(null)
  const [editing, setEditing] = useState<Lead | null>(null)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  // Verifica status da API key no mount
  useEffect(() => {
    window.api.youtube.hasKey().then(setHasKey)
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const res = await window.api.youtube.search({
        q: query.trim(),
        region: region === 'all' ? undefined : region,
        maxResults: 20
      })
      setSearchResult(res)
      // atualiza hasKey se falhou por no_api_key
      if (!res.ok && res.reason === 'no_api_key') setHasKey(false)
      else if (res.ok) setHasKey(true)
    } finally {
      setSearching(false)
    }
  }

  // Aplica filtros client-side (size + score threshold)
  const filteredResults = useMemo(() => {
    if (!searchResult?.items) return []
    return searchResult.items.filter((it) => {
      if (size === 'micro' && it.followers >= 100000) return false
      if (size === 'mid' && (it.followers < 100000 || it.followers >= 500000)) return false
      if (size === 'macro' && it.followers < 500000) return false
      if (region !== 'all' && it.region && it.region !== region) return false
      return true
    })
  }, [searchResult, size, region])

  const sortedResults = useMemo(() => {
    // Quem tem email (preenchido manualmente antes via edit) primeiro,
    // depois por score desc
    return [...filteredResults].sort((a, b) => b.score - a.score)
  }, [filteredResults])

  const handleSaveLead = async (item: YouTubeSearchItem) => {
    if (!active) return
    setSaving((s) => ({ ...s, [item.externalId]: true }))
    try {
      await create({
        externalId: item.externalId,
        source: 'youtube',
        name: item.name,
        handle: item.handle,
        avatarUrl: item.avatarUrl,
        region: item.region,
        category: item.category,
        followers: item.followers,
        score: item.score,
        email: null,
        notes: null,
        status: 'new'
      })
    } finally {
      setSaving((s) => ({ ...s, [item.externalId]: false }))
    }
  }

  const handleDeleteSaved = async (id: number) => {
    if (!confirm(t('leads.confirm_delete'))) return
    await remove(id)
  }

  const stats = useMemo(() => {
    const saved = leads.length
    const avgScore = leads.length
      ? Math.round(leads.reduce((a, l) => a + l.score, 0) / leads.length)
      : 0
    const withEmail = leads.filter((l) => l.email).length
    return { saved, avgScore, withEmail }
  }, [leads])

  const bannerReason = !hasKey
    ? t('leads.no_key_banner')
    : searchResult && !searchResult.ok && searchResult.reason === 'api_error'
      ? `${t('leads.api_error')}: ${searchResult.status ?? ''}`
      : searchResult && !searchResult.ok && searchResult.reason === 'network_error'
        ? t('leads.network_error')
        : null

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Banner: status da key / erro da API */}
        {bannerReason && (
          <div
            className="mb-4 rounded-[10px] px-4 py-3 flex items-start gap-2"
            style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}
          >
            <AlertTriangle size={16} color="#fbbf24" className="shrink-0 mt-0.5" />
            <div className="text-[13px]" style={{ color: '#fbbf24' }}>
              {bannerReason}
            </div>
          </div>
        )}

        {/* Hero search */}
        <Card className="mb-4" padding="22px 24px">
          <div className="flex items-center gap-2 mb-2">
            <Search size={16} color="#a78bfa" strokeWidth={1.75} />
            <span className="text-[12px] font-semibold" style={{ color: '#a78bfa' }}>
              {t('leads.source_label')}
            </span>
          </div>
          <div className="text-[20px] font-semibold mb-4" style={{ color: '#f4f4f6' }}>
            {t('leads.title')}
          </div>
          <div
            className="flex items-center gap-2 rounded-[10px] px-4 py-3"
            style={{ background: '#0e0e10', border: '1px solid #232327' }}
          >
            <Search size={18} color="#7a7a80" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('leads.search_placeholder')}
              className="flex-1 bg-transparent outline-none text-[14px]"
              style={{ color: '#e8e8ea' }}
            />
            <Btn
              variant="primary"
              size="sm"
              leftIcon={<Search size={14} strokeWidth={1.75} />}
              onClick={handleSearch}
              disabled={searching || !query.trim()}
            >
              {searching ? t('common.loading') : t('leads.search')}
            </Btn>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-3 mt-4">
            <FilterChips
              label={t('leads.filter_size')}
              options={[
                { v: 'all', l: t('leads.size_all') },
                { v: 'micro', l: t('leads.size_micro') },
                { v: 'mid', l: t('leads.size_mid') },
                { v: 'macro', l: t('leads.size_macro') }
              ]}
              value={size}
              onChange={setSize}
            />
            <FilterChips
              label={t('leads.filter_region')}
              options={[
                { v: 'all', l: t('leads.region_all') },
                { v: 'BR', l: t('leads.region_BR') },
                { v: 'US', l: t('leads.region_US') },
                { v: 'EU', l: t('leads.region_EU') }
              ]}
              value={region}
              onChange={setRegion}
            />
          </div>
        </Card>

        {/* Resultados da busca (se houve) */}
        {searchResult && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[15px] font-semibold" style={{ color: '#f4f4f6' }}>
                {t('leads.search_results')} ({sortedResults.length})
              </span>
              <span className="text-[12px]" style={{ color: '#86868d' }}>
                {t('leads.sorted_by_score')}
              </span>
            </div>
            <Card className="mb-4" padding="14px 16px">
              {sortedResults.length === 0 ? (
                <div className="py-10 text-center text-text-muted text-sm">
                  {t('leads.no_results')}
                </div>
              ) : (
                sortedResults.map((r) => (
                  <div
                    key={r.externalId}
                    className="flex items-center gap-3 px-2 py-3 rounded-[9px] hover:opacity-90 transition-opacity"
                  >
                    <AvatarBlock name={r.name} url={r.avatarUrl} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold" style={{ color: '#f0f0f2' }}>
                          {r.name}
                        </span>
                        {r.handle && (
                          <span className="text-[11px]" style={{ color: '#86868d' }}>
                            {r.handle}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px]" style={{ color: '#86868d' }}>
                        {r.category ?? t('leads.category_unknown')} · {r.region ?? '—'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[12px]" style={{ color: '#b8b8be' }}>
                      <MapPin size={12} color="#7a7a80" />
                      <span>{formatFollowers(r.followers)}</span>
                    </div>
                    <div
                      className="px-2.5 py-1 rounded-md text-[12px] font-semibold"
                      style={{
                        background: r.score >= 80 ? 'rgba(74, 222, 128, 0.12)' : 'rgba(139, 92, 246, 0.12)',
                        color: r.score >= 80 ? '#4ade80' : '#8b5cf6'
                      }}
                    >
                      {r.score}
                    </div>
                    <Btn
                      variant="secondary"
                      size="sm"
                      leftIcon={saving[r.externalId] ? undefined : <Plus size={12} strokeWidth={1.75} />}
                      onClick={() => handleSaveLead(r)}
                      disabled={saving[r.externalId]}
                    >
                      {saving[r.externalId] ? t('common.loading') : t('leads.save')}
                    </Btn>
                  </div>
                ))
              )}
            </Card>
          </>
        )}

        {/* Stats agregados (sobre os SALVOS) */}
        <div className="flex gap-[14px] mb-4">
          <Card className="flex-1">
            <div className="text-[13px] mb-1.5" style={{ color: '#86868d' }}>
              {t('leads.stat_saved')}
            </div>
            <div className="text-[28px] font-bold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>
              {stats.saved}
            </div>
          </Card>
          <Card className="flex-1">
            <div className="text-[13px] mb-1.5" style={{ color: '#86868d' }}>
              {t('leads.stat_with_email')}
            </div>
            <div className="text-[28px] font-bold tracking-[-.01em]" style={{ color: '#4ade80' }}>
              {stats.withEmail}
            </div>
          </Card>
          <Card className="flex-1">
            <div className="text-[13px] mb-1.5" style={{ color: '#86868d' }}>
              {t('leads.stat_avg_score')}
            </div>
            <div className="text-[28px] font-bold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>
              {stats.avgScore}
            </div>
          </Card>
        </div>

        {/* Lista de salvos */}
        <Card padding="14px 16px">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[15px] font-semibold" style={{ color: '#f4f4f6' }}>
              {t('leads.saved_title')}
            </span>
            <span className="text-[12px]" style={{ color: '#86868d' }}>
              {t('leads.sorted_by_score')}
            </span>
          </div>
          {leadsLoading && leads.length === 0 ? (
            <div className="py-10 text-center text-text-muted text-sm">{t('common.loading')}</div>
          ) : leads.length === 0 ? (
            <div className="py-10 text-center text-text-muted text-sm">
              {t('leads.no_saved')}
            </div>
          ) : (
            leads.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-3 px-2 py-3 rounded-[9px] hover:opacity-90 transition-opacity"
                style={{ borderBottom: '1px solid #161618' }}
              >
                <AvatarBlock name={l.name} url={l.avatarUrl} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold" style={{ color: '#f0f0f2' }}>
                      {l.name}
                    </span>
                    {l.email && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' }}
                      >
                        EMAIL
                      </span>
                    )}
                  </div>
                  <div className="text-[11px]" style={{ color: '#86868d' }}>
                    {l.email ?? l.handle ?? l.category ?? '—'}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[12px]" style={{ color: '#b8b8be' }}>
                  <MapPin size={12} color="#7a7a80" />
                  <span>{l.region ?? '—'}</span>
                  <span style={{ color: '#7a7a80' }}>·</span>
                  <span>{formatFollowers(l.followers)}</span>
                </div>
                <div
                  className="px-2.5 py-1 rounded-md text-[12px] font-semibold"
                  style={{
                    background: l.score >= 80 ? 'rgba(74, 222, 128, 0.12)' : 'rgba(139, 92, 246, 0.12)',
                    color: l.score >= 80 ? '#4ade80' : '#8b5cf6'
                  }}
                >
                  {l.score}
                </div>
                <Btn
                  variant="secondary"
                  size="sm"
                  leftIcon={<Save size={12} strokeWidth={1.75} />}
                  onClick={() => setEditing(l)}
                >
                  {t('leads.edit')}
                </Btn>
                <Btn
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSaved(l.id)}
                  title={t('common.delete')}
                >
                  <Trash2 size={12} />
                </Btn>
              </div>
            ))
          )}
        </Card>
      </div>

      {editing && (
        <EditLeadDialog
          lead={editing}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            await update(editing.id, data)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

function AvatarBlock({ name, url }: { name: string; url: string | null }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-9 h-9 rounded-full object-cover shrink-0"
      />
    )
  }
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div
      className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[13px] font-semibold text-white"
      style={{ background: '#a78bfa' }}
    >
      {initials}
    </div>
  )
}

function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange
}: {
  label: string
  options: { v: T; l: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px]" style={{ color: '#86868d' }}>
        {label}:
      </span>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.v}
            onClick={() => onChange(opt.v)}
            className="px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors"
            style={{
              background: value === opt.v ? '#26262a' : 'transparent',
              color: value === opt.v ? '#f4f4f6' : '#86868d',
              border: '1px solid #232327'
            }}
          >
            {opt.l}
          </button>
        ))}
      </div>
    </div>
  )
}

function EditLeadDialog({
  lead,
  onClose,
  onSave
}: {
  lead: Lead
  onClose: () => void
  onSave: (data: Partial<Lead>) => Promise<void>
}) {
  const t = useT()
  const [email, setEmail] = useState(lead.email ?? '')
  const [notes, setNotes] = useState(lead.notes ?? '')
  const [status, setStatus] = useState(lead.status)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        email: email.trim() || null,
        notes: notes.trim() || null,
        status
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--color-scrim)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-card border border-border rounded-xl w-full max-w-md p-5 space-y-3 shadow-pop"
      >
        <div className="flex items-center gap-2 mb-1">
          <AvatarBlock name={lead.name} url={lead.avatarUrl} />
          <div>
            <div className="text-[14px] font-semibold">{lead.name}</div>
            <div className="text-[11px]" style={{ color: '#86868d' }}>
              {lead.handle ?? lead.region ?? '—'} · {formatFollowers(lead.followers)}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">{t('leads.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('leads.email_placeholder')}
            className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">{t('leads.notes')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={t('leads.notes_placeholder')}
            className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">{t('leads.status')}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
          >
            {(['new', 'contacted', 'replied', 'converted', 'rejected'] as const).map((s) => (
              <option key={s} value={s}>
                {t(`leads.status.${s}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            {t('common.cancel')}
          </button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1">
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}