import { useState, useEffect } from 'react'
import { Play, Pause, Timer, AlertTriangle, CheckCircle2, X, Focus } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Btn } from '../components/ui/Btn'
import { Pill } from '../components/ui/Pill'
import { Avatar } from '../components/ui/Avatar'

/**
 * Ritmo (Profissional) — produtividade do editor.
 *
 * Template "Ritmo" do `Tempo Dashboard.dc.html`:
 *   - Bloco A: Pomodoro (anel grande + meta diária + streak + heatmap de horas +
 *     tempo médio Short/Longform + alerta de projeto parado)
 *   - Bloco B: Fila priorizada + time blocking + deadlines + checklist
 *     (Corte → Sound → Color → Export) + Modo foco em overlay
 *   - Bloco C: Tempo de resposta por cliente
 */

type QueueItem = {
  client: string
  video: string
  priority: 'high' | 'med' | 'low'
  due: string
}

const QUEUE: QueueItem[] = [
  { client: 'Northwind', video: 'Edição 14 — Hero Film', priority: 'high', due: '28 jun' },
  { client: 'Lumen Studio', video: 'Short Vertical #08', priority: 'high', due: '30 jun' },
  { client: 'Brightline', video: 'Documentário Cap. 3', priority: 'med', due: '02 jul' },
  { client: 'Velasco Films', video: 'Reel Cliente Final', priority: 'med', due: '05 jul' },
  { client: 'Pixel & Co', video: 'Behind the Scenes', priority: 'low', due: '08 jul' }
]

const PRIORITY_TONE = {
  high: { tone: 'danger' as const, label: 'Alta' },
  med: { tone: 'warning' as const, label: 'Média' },
  low: { tone: 'muted' as const, label: 'Baixa' }
}

const STEPS = ['Corte', 'Sound', 'Color', 'Export'] as const

const HEATMAP_DAYS = 14 // 2 semanas
const HEATMAP_HOURS = ['8h', '10h', '12h', '14h', '16h', '18h', '20h']

export function Ritmo() {
  const [seconds, setSeconds] = useState(22 * 60) // 22 min restantes de 25
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState<boolean[]>([true, true, true, false]) // 3/4 steps feitos
  const [focusMode, setFocusMode] = useState(false)

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [running])

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const pomoPct = ((25 * 60 - seconds) / (25 * 60)) * 100

  const toggleStep = (i: number) => {
    setDone((prev) => prev.map((d, j) => (j === i ? !d : d)))
  }

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Bloco A: Pomodoro + heatmap + stats */}
        <div className="flex gap-[14px] mb-4 items-stretch">
          {/* Pomodoro */}
          <Card className="flex-1" padding="22px 24px">
            <div className="flex items-center gap-2 mb-3">
              <Timer size={16} color="#a78bfa" strokeWidth={1.75} />
              <span className="text-[14px] font-semibold" style={{ color: '#f4f4f6' }}>Pomodoro</span>
              <span className="ml-auto text-[11.5px]" style={{ color: '#7a7a80' }}>Northwind · Edição 14</span>
            </div>
            <div className="flex items-center gap-6">
              {/* Anel de progresso */}
              <div className="relative" style={{ width: 120, height: 120 }}>
                <svg viewBox="0 0 120 120" style={{ width: 120, height: 120, transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#1d1d20" strokeWidth="13" />
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="13"
                    strokeDasharray={`${(pomoPct / 100) * 289} 289`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[24px] font-bold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>
                    {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                  </span>
                  <span className="text-[10px]" style={{ color: '#86868d' }}>de 25 min</span>
                </div>
              </div>

              {/* Meta diária + streak */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px]" style={{ color: '#86868d' }}>Meta do dia</span>
                  <span className="text-[13px] font-semibold" style={{ color: '#f4f4f6' }}>4 / 6 pomodoros</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: '#1d1d20' }}>
                  <div className="h-full" style={{ width: '66%', background: '#8b5cf6', borderRadius: '999px' }} />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[13px]" style={{ color: '#86868d' }}>Streak</span>
                  <span className="text-[16px] font-bold" style={{ color: '#fbbf24' }}>🔥 12 dias</span>
                </div>
                <Btn
                  variant="primary"
                  size="md"
                  leftIcon={running ? <Pause size={14} strokeWidth={1.75} /> : <Play size={14} strokeWidth={1.75} />}
                  onClick={() => setRunning((r) => !r)}
                >
                  {running ? 'Pausar' : 'Iniciar'}
                </Btn>
              </div>
            </div>
          </Card>

          {/* Heatmap + stats */}
          <div className="flex-1 flex flex-col gap-[14px]">
            <Card className="flex-1" padding="16px 18px">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[14px] font-semibold" style={{ color: '#f4f4f6' }}>Heatmap de horas</span>
                <span className="ml-auto text-[11px]" style={{ color: '#7a7a80' }}>últimos 14 dias</span>
              </div>
              <div className="flex gap-1">
                <div className="flex flex-col justify-between text-[10px]" style={{ color: '#6a6a70', paddingRight: 4 }}>
                  {HEATMAP_HOURS.map((h) => <span key={h}>{h}</span>)}
                </div>
                <div className="flex-1 grid grid-cols-14 gap-1" style={{ gridTemplateColumns: `repeat(${HEATMAP_DAYS}, 1fr)` }}>
                  {Array.from({ length: HEATMAP_DAYS * HEATMAP_HOURS.length }).map((_, i) => {
                    // Gera intensidade pseudo-aleatória baseada em hash do índice
                    const intensity = (Math.sin(i * 17.3) + 1) / 2
                    const opacity = 0.05 + intensity * 0.95
                    return (
                      <div
                        key={i}
                        className="rounded-[2px]"
                        style={{
                          aspectRatio: '1 / 1',
                          background: `rgba(139, 92, 246, ${opacity.toFixed(2)})`
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            </Card>

            <div className="flex gap-[14px]">
              <Card className="flex-1" padding="14px 16px">
                <div className="text-[11.5px] mb-1" style={{ color: '#86868d' }}>Tempo médio Short</div>
                <div className="text-[20px] font-bold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>1h 45m</div>
              </Card>
              <Card className="flex-1" padding="14px 16px">
                <div className="text-[11.5px] mb-1" style={{ color: '#86868d' }}>Tempo médio Longform</div>
                <div className="text-[20px] font-bold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>6h 20m</div>
              </Card>
            </div>
          </div>
        </div>

        {/* Alerta projeto parado */}
        <Card
          className="mb-4 flex items-center gap-3"
          padding="14px 18px"
          style={{ background: 'rgba(248, 113, 113, 0.06)', border: '1px solid rgba(248, 113, 113, 0.25)' }}
        >
          <AlertTriangle size={18} color="#f87171" strokeWidth={1.75} />
          <div className="flex-1">
            <div className="text-[13px] font-semibold" style={{ color: '#f87171' }}>Projeto parado há 4 dias</div>
            <div className="text-[11.5px]" style={{ color: '#b8b8be' }}>
              Northwind · Edição 13 — sem progresso desde 22 jun
            </div>
          </div>
          <Btn variant="secondary" size="sm">Retomar</Btn>
        </Card>

        {/* Bloco B: Fila + Checklist + Modo foco */}
        <div className="flex gap-[14px] mb-4 items-stretch">
          {/* Fila priorizada */}
          <Card className="flex-1" padding="18px 20px">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[14px] font-semibold" style={{ color: '#f4f4f6' }}>Fila priorizada</span>
              <span className="ml-auto text-[11px]" style={{ color: '#7a7a80' }}>{QUEUE.length} itens</span>
            </div>
            <div className="flex flex-col gap-1">
              {QUEUE.map((q, i) => {
                const { tone, label } = PRIORITY_TONE[q.priority]
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2.5 px-2 rounded-[9px] hover:opacity-90 transition-opacity"
                    style={{ borderBottom: i < QUEUE.length - 1 ? '1px solid #161618' : 'none' }}
                  >
                    <span className="text-[12px] font-semibold w-[18px]" style={{ color: '#7a7a80' }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold truncate" style={{ color: '#f0f0f2' }}>{q.video}</div>
                      <div className="text-[11px]" style={{ color: '#7a7a80' }}>{q.client}</div>
                    </div>
                    <Pill tone={tone} dot={false}>{label}</Pill>
                    <span className="text-[12px]" style={{ color: '#86868d' }}>{q.due}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Checklist */}
          <Card className="flex-1" padding="18px 20px">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[14px] font-semibold" style={{ color: '#f4f4f6' }}>Workflow · Edição 14</span>
              <span className="ml-auto text-[11px]" style={{ color: '#7a7a80' }}>3/4 etapas</span>
            </div>
            <div className="flex flex-col gap-2">
              {STEPS.map((step, i) => (
                <button
                  key={step}
                  onClick={() => toggleStep(i)}
                  className="flex items-center gap-3 py-2 px-3 rounded-[9px] text-left transition-colors"
                  style={{
                    background: done[i] ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                    border: done[i] ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid #232327'
                  }}
                >
                  {done[i] ? (
                    <CheckCircle2 size={18} color="#8b5cf6" strokeWidth={1.75} />
                  ) : (
                    <span
                      className="inline-block w-[18px] h-[18px] rounded-full"
                      style={{ border: '2px solid #3a3a3e' }}
                    />
                  )}
                  <span className="text-[13px] font-medium" style={{ color: done[i] ? '#f0f0f2' : '#86868d' }}>
                    {step}
                  </span>
                </button>
              ))}
            </div>
            <Btn
              variant="primary"
              size="md"
              className="mt-4 w-full"
              leftIcon={<Focus size={14} strokeWidth={1.75} />}
              onClick={() => setFocusMode(true)}
            >
              Entrar em modo foco
            </Btn>
          </Card>
        </div>

        {/* Bloco C: Tempo de resposta por cliente */}
        <Card padding="18px 20px">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[14px] font-semibold" style={{ color: '#f4f4f6' }}>Tempo de resposta por cliente</span>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { client: 'Northwind', initial: 'N', av: '#8b5cf6', hours: 1.2, color: '#4ade80' },
              { client: 'Lumen Studio', initial: 'L', av: '#a78bfa', hours: 2.5, color: '#4ade80' },
              { client: 'Brightline', initial: 'B', av: '#6d4ee0', hours: 8.4, color: '#fbbf24' },
              { client: 'Velasco Films', initial: 'V', av: '#4f4193', hours: 12.1, color: '#f87171' },
              { client: 'Pixel & Co', initial: 'P', av: '#5b6b8c', hours: 4.7, color: '#fbbf24' }
            ].map((c) => {
              const pct = Math.min(100, (c.hours / 12) * 100)
              return (
                <div key={c.client} className="flex items-center gap-3">
                  <Avatar gradient={c.av} initial={c.initial} size="sm" />
                  <span className="text-[13px] w-[140px]" style={{ color: '#e8e8ea' }}>{c.client}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1d1d20' }}>
                    <div className="h-full" style={{ width: `${pct}%`, background: c.color, borderRadius: '999px' }} />
                  </div>
                  <span className="text-[12px] font-semibold w-[60px] text-right" style={{ color: '#f4f4f6' }}>
                    {c.hours}h
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Modo foco overlay */}
      {focusMode && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#0a0a0b',
            zIndex: 90,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <button
            onClick={() => setFocusMode(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#161619', border: '1px solid #232327', color: '#9a9aa0' }}
          >
            <X size={18} />
          </button>
          <div className="text-[14px] mb-3" style={{ color: '#a78bfa' }}>MODO FOCO</div>
          <div className="text-[20px] mb-8" style={{ color: '#f4f4f6' }}>Northwind · Edição 14</div>
          <div className="text-[88px] font-bold tracking-[-.02em] mb-8" style={{ color: '#f4f4f6' }}>
            {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <Btn variant="primary" size="md" leftIcon={running ? <Pause size={14} /> : <Play size={14} />} onClick={() => setRunning((r) => !r)}>
            {running ? 'Pausar' : 'Retomar'}
          </Btn>
        </div>
      )}
    </div>
  )
}