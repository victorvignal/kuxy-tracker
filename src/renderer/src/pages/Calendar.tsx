import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
import { useT } from '../lib/i18n'
import { useProfileStore } from '../store/useProfile'
import { useCompletions, groupByDate } from '../hooks/useCompletions'
import { DayDetailDialog } from '../components/calendar/DayDetailDialog'
import type { Habit } from '../types'

export function Calendar() {
  const t = useT()
  const activeWs = useProfileStore((s) => s.getActive())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [habits, setHabits] = useState<Habit[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // range do mês visível
  const from = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
  const to = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
  const { items: completions, refresh: refreshCompletions } = useCompletions(activeWs?.id, { from, to })

  useEffect(() => {
    const load = async () => {
      if (!activeWs) return
      const h = await window.api.habits.list({ profileId: activeWs.id })
      setHabits(h as Habit[])
    }
    load()
  }, [activeWs?.id])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const completionsByDate = groupByDate(completions)

  const dayLabels = [
    t('calendar.days.sun'),
    t('calendar.days.mon'),
    t('calendar.days.tue'),
    t('calendar.days.wed'),
    t('calendar.days.thu'),
    t('calendar.days.fri'),
    t('calendar.days.sat')
  ]

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
              className="btn-ghost p-1.5 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentMonth(new Date())} className="btn btn-secondary text-xs">
              {t('calendar.today')}
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="btn-ghost p-1.5 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {dayLabels.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] text-text-subtle uppercase tracking-wider font-medium py-1"
            >
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
            const intensity = Math.min(1, dayCompletions.length / Math.max(habits.filter((h) => !h.archived).length, 1))
            const clickable = inMonth && !!activeWs
            return (
              <button
                key={dateStr}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && setSelectedDate(dateStr)}
                className={`aspect-square rounded-md border p-1.5 flex flex-col text-xs text-left transition-all ${
                  inMonth ? 'border-border bg-bg-subtle hover:border-accent hover:bg-bg-elevated cursor-pointer' : 'border-transparent bg-transparent text-text-subtle cursor-default'
                } ${isToday ? 'ring-1 ring-accent' : ''} disabled:cursor-default`}
                style={
                  inMonth && intensity > 0
                    ? {
                        background: `rgba(168, 85, 247, ${0.05 + intensity * 0.4})`,
                        borderColor: 'rgba(168, 85, 247, 0.3)'
                      }
                    : {}
                }
              >
                <div className={`text-[11px] ${isToday ? 'font-semibold text-accent' : 'text-text-muted'}`}>
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
                          style={{ background: h?.color || '#a855f7' }}
                        />
                      )
                    })}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <p className="text-[11px] text-text-subtle mt-3">
          Clica num dia pra ver/toggle hábitos. Com intensidade baseada em quantos hábitos você fez.
        </p>
      </div>

      {selectedDate && activeWs && (
        <DayDetailDialog
          date={selectedDate}
          habits={habits}
          profileId={activeWs.id}
          onClose={() => {
            setSelectedDate(null)
            refreshCompletions()
          }}
        />
      )}
    </div>
  )
}
