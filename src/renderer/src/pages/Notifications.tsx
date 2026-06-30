import { Bell } from 'lucide-react'

/**
 * Notifications — inbox de notificações.
 *
 * Visual baseado no template `Tempo Dashboard.dc.html`. Cada card tem
 * avatar com inicial colorida + título + descrição + timestamp relativo.
 *
 * Categorias: budget_exceeded (vermelho), goal_reached (verde),
 * subscription_due (amarelo), generic (azul).
 */

type Notif = {
  id: string
  initials: string
  title: string
  description: string
  time: string
  category: 'budget' | 'goal' | 'subscription' | 'generic'
}

const NOTIFS: Notif[] = [
  {
    id: '1',
    initials: 'B',
    title: 'Food budget exceeded',
    description: "You spent R$ 320 on Food this month — that's R$ 20 over your R$ 300 budget. Consider reducing restaurant visits.",
    time: '2 hours ago',
    category: 'budget'
  },
  {
    id: '2',
    initials: 'G',
    title: 'Savings goal reached!',
    description: "You hit your Total Savings goal of R$ 14.999. Consider increasing the target to keep pushing.",
    time: '5 hours ago',
    category: 'goal'
  },
  {
    id: '3',
    initials: 'S',
    title: 'Netflix renewal due in 3 days',
    description: 'Your Netflix subscription (R$ 55/month) will renew on Jun 26. Total monthly subscriptions: R$ 312.',
    time: '1 day ago',
    category: 'subscription'
  },
  {
    id: '4',
    initials: 'T',
    title: 'New transaction recorded',
    description: 'Salary income of R$ 7.500 was added to your Nubank account on Jun 1.',
    time: '2 days ago',
    category: 'generic'
  },
  {
    id: '5',
    initials: 'B',
    title: 'Transport budget warning',
    description: "You've used 85% of your Transport budget with 10 days left in the month.",
    time: '3 days ago',
    category: 'budget'
  },
  {
    id: '6',
    initials: 'G',
    title: 'Monthly Income milestone',
    description: 'Your monthly income reached R$ 9.300 — highest in 3 months. Keep it up!',
    time: '4 days ago',
    category: 'goal'
  },
  {
    id: '7',
    initials: 'S',
    title: 'Spotify renewal',
    description: 'Spotify Premium (R$ 22/month) was renewed automatically. Next charge: Jul 10.',
    time: '5 days ago',
    category: 'subscription'
  }
]

const CATEGORY_STYLES = {
  budget: { bg: 'rgba(248,113,113,0.12)', fg: '#f87171' },
  goal: { bg: 'rgba(74,222,128,0.12)', fg: '#4ade80' },
  subscription: { bg: 'rgba(250,204,21,0.12)', fg: '#facc15' },
  generic: { bg: 'rgba(139,92,246,0.12)', fg: '#a78bfa' }
} as const

export function Notifications() {
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {NOTIFS.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={48} color="#86868d" strokeWidth={1.5} className="mx-auto mb-4" />
            <div className="text-tmpl-card-title mb-2" style={{ color: '#f4f4f6' }}>
              No notifications
            </div>
            <div className="text-tmpl-body-sm" style={{ color: '#86868d' }}>
              You're all caught up!
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {NOTIFS.map((n) => {
              const styles = CATEGORY_STYLES[n.category]
              return (
                <div
                  key={n.id}
                  className="flex items-start gap-[14px] p-[16px] rounded-[12px] hover:opacity-95 transition-opacity cursor-pointer"
                  style={{ background: '#141416', border: '1px solid #1f1f22' }}
                >
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 text-tmpl-table font-semibold"
                    style={{ background: styles.bg, color: styles.fg }}
                  >
                    {n.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-tmpl-body font-medium mb-1" style={{ color: '#f4f4f6' }}>
                      {n.title}
                    </div>
                    <div className="text-tmpl-label leading-[1.5]" style={{ color: '#86868d' }}>
                      {n.description}
                    </div>
                  </div>
                  <div className="text-tmpl-label-xs whitespace-nowrap" style={{ color: '#6a6a70' }}>
                    {n.time}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
