import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  isSameMonth,
  isSameDay
} from 'date-fns'
import { Card } from '../components/ui/Card'
import { Btn } from '../components/ui/Btn'
import { Avatar } from '../components/ui/Avatar'
import { useProfileStore } from '../store/useProfile'

/**
 * Calendar — Pessoal (hábitos) + Profissional (entregas de clientes).
 *
 * Pessoal: grid mensal com bolinhas coloridas dos hábitos completados no dia.
 * Profissional: grid mensal com eventos (cliente + avatar + vídeo) + faixa
 *   "Próximas entregas" no topo (template).
 */

type Delivery = {
  day: number // dia do mês
  client: string
  initial: string
  av: string
  video: string
  color: string // borda lateral do evento
}

const PRO_DELIVERIES: Delivery[] = [
  { day: 28, client: 'Northwind', initial: 'N', av: '#8b5cf6', video: 'Edição 14', color: '#4ade80' },
  { day: 30, client: 'Lumen Studio', initial: 'L', av: '#a78bfa', video: 'Short #08', color: '#fbbf24' },
  { day: 2, client: 'Brightline', initial: 'B', av: '#6d4ee0', video: 'Doc Cap. 3', color: '#f87171' },
  { day: 5, client: 'Velasco Films', initial: 'V', av: '#4f4193', video: 'Reel Final', color: '#4ade80' },
  { day: 8, client: 'Pixel & Co', initial: 'P', av: '#5b6b8c', video: 'BTS', color: '#4ade80' },
  { day: 12, client: 'Atlas Media', initial: 'A', av: '#7a6b9c', video: 'Trailer', color: '#fbbf24' }
]

export function Calendar() {
  const active = useProfileStore((s) => s.getActive())

  if (active?.type === 'professional') {
    return <CalendarPro />
  }

  return <CalendarPersonal />
}

function CalendarPro() {
  const [month, setMonth] = useState(new Date())
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  // Próximas entregas (próximos 4 do mês atual ou seguinte)
  const today = new Date()
  const upcoming = PRO_DELIVERIES.filter((d) => {
    const date = new Date(month.getFullYear(), month.getMonth(), d.day)
    return date >= today || isSameMonth(date, month)
  })
    .sort((a, b) => {
      const da = new Date(month.getFullYear(), month.getMonth(), a.day)
      const db = new Date(month.getFullYear(), month.getMonth(), b.day)
      return da.getTime() - db.getTime()
    })
    .slice(0, 4)

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Próximas entregas */}
        <Card className="mb-4" padding="16px 18px">
          <div className="flex items-center gap-2 mb-3">
            <CalIcon size={16} color="#a78bfa" strokeWidth={1.75} />
            <span className="text-[14px] font-semibold" style={{ color: '#f4f4f6' }}>Próximas entregas</span>
            <span className="ml-auto text-[11px]" style={{ color: '#7a7a80' }}>{upcoming.length} esta semana</span>
          </div>
          <div className="flex gap-3 overflow-x-auto">
            {upcoming.map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-[9px] shrink-0"
                style={{ background: '#1a1a1d', border: '1px solid #232327' }}
              >
                <Avatar gradient={d.av} initial={d.initial} size="sm" />
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold truncate" style={{ color: '#f0f0f2' }}>
                    {d.day} {format(month, 'MMM')} · {d.client}
                  </div>
                  <div className="text-[11px] truncate" style={{ color: '#7a7a80' }}>{d.video}</div>
                </div>
                <span className="w-2 h-2 rounded-full ml-1" style={{ background: d.color }} />
              </div>
            ))}
          </div>
        </Card>

        {/* Grid do mês */}
        <Card padding="20px 24px">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-semibold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>
              {format(month, "MMMM yyyy")}
            </h2>
            <div className="flex items-center gap-2">
              <Btn variant="ghost" size="sm" leftIcon={<ChevronLeft size={14} strokeWidth={1.75} />} onClick={() => setMonth(addMonths(month, -1))}>
              </Btn>
              <Btn variant="secondary" size="sm" onClick={() => setMonth(new Date())}>
                Hoje
              </Btn>
              <Btn variant="ghost" size="sm" leftIcon={<ChevronRight size={14} strokeWidth={1.75} />} onClick={() => setMonth(addMonths(month, 1))}>
              </Btn>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {weekdays.map((d, i) => (
              <div key={i} className="text-center text-[11px] uppercase font-semibold py-1" style={{ color: '#7a7a80' }}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
              const inMonth = isSameMonth(day, month)
              const isToday = isSameDay(day, new Date())
              const dayDeliveries = PRO_DELIVERIES.filter((d) => d.day === day.getDate() && day.getMonth() === month.getMonth())
              return (
                <div
                  key={day.toISOString()}
                  className="min-h-[88px] rounded-[9px] p-2 flex flex-col gap-1"
                  style={{
                    background: inMonth ? '#0e0e10' : 'transparent',
                    border: isToday ? '1px solid #8b5cf6' : '1px solid #1f1f22'
                  }}
                >
                  <div
                    className="text-[12px] font-semibold"
                    style={{ color: isToday ? '#a78bfa' : inMonth ? '#e8e8ea' : '#6a6a70' }}
                  >
                    {format(day, 'd')}
                  </div>
                  {dayDeliveries.slice(0, 2).map((d, j) => (
                    <div
                      key={j}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-[5px]"
                      style={{ background: `${d.color}26` }}
                    >
                      <Avatar gradient={d.av} initial={d.initial} size="xs" />
                      <span className="text-[10px] truncate" style={{ color: d.color }}>
                        {d.video}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

// === Calendar Pessoal: usa lógica antiga inline (sem mexer no Habits/Completions) ===

import { useEffect } from 'react'
import { useT } from '../lib/i18n'
import type { Completion, Habit } from '../types'

function CalendarPersonal() {
  const t = useT()
  const activeWs = useProfileStore((s) => s.getActive())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [completions, setCompletions] = useState<Completion[]>([])
  const [habits, setHabits] = useState<Habit[]>([])

  useEffect(() => {
    const load = async () => {
      if (!activeWs) return
      const from = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
      const to = format(endOfMonth(addMonths(currentMonth, 1)), 'yyyy-MM-dd')
      const [c, h] = await Promise.all([
        window.api.completions.list({ from, to, profileId: activeWs.id }),
        window.api.habits.list({ profileId: activeWs.id })
      ])
      setCompletions(c as Completion[])
      setHabits(h as Habit[])
    }
    load()
  }, [currentMonth, activeWs?.id])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const completionsByDate = new Map<string, Completion[]>()
  for (const c of completions) {
    if (!completionsByDate.has(c.date)) completionsByDate.set(c.date, [])
    completionsByDate.get(c.date)!.push(c)
  }

  const dayLabels = [
    t('calendar.days.sun'), t('calendar.days.mon'), t('calendar.days.tue'),
    t('calendar.days.wed'), t('calendar.days.thu'), t('calendar.days.fri'),
    t('calendar.days.sat')
  ]

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        <Card padding="20px 24px">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-semibold tracking-[-.01em]" style={{ color: '#f4f4f6' }}>
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <Btn variant="ghost" size="sm" leftIcon={<ChevronLeft size={14} strokeWidth={1.75} />} onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} />
              <Btn variant="secondary" size="sm" onClick={() => setCurrentMonth(new Date())}>
                {t('calendar.today')}
              </Btn>
              <Btn variant="ghost" size="sm" leftIcon={<ChevronRight size={14} strokeWidth={1.75} />} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} />
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {dayLabels.map((d) => (
              <div key={d} className="text-center text-[11px] uppercase font-semibold py-1" style={{ color: '#7a7a80' }}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const inMonth = isSameMonth(day, currentMonth)
              const isToday = isSameDay(day, new Date())
              const dayCompletions = completionsByDate.get(dateStr) || []
              const intensity = Math.min(1, dayCompletions.length / Math.max(habits.length, 1))
              return (
                <div
                  key={dateStr}
                  className="aspect-square rounded-md p-1.5 flex flex-col text-xs"
                  style={{
                    background: inMonth
                      ? `rgba(139, 92, 246, ${(0.05 + intensity * 0.3).toFixed(2)})`
                      : 'transparent',
                    border: isToday ? '1px solid #8b5cf6' : inMonth ? '1px solid #1f1f22' : '1px solid transparent'
                  }}
                >
                  <div className="text-[11px]" style={{ color: isToday ? '#a78bfa' : inMonth ? '#e8e8ea' : '#6a6a70' }}>
                    {format(day, 'd')}
                  </div>
                  {inMonth && dayCompletions.length > 0 && (
                    <div className="mt-auto flex gap-0.5 flex-wrap">
                      {dayCompletions.slice(0, 6).map((c, i) => {
                        const h = habits.find((x) => x.id === c.habitId)
                        return (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: h?.color || '#a78bfa' }}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}