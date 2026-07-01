import { useProfileStore } from '../store/useProfile'
import { Dashboard } from '../pages/Dashboard'
import { DashboardPro } from '../pages/DashboardPro'
import { Notifications } from '../pages/Notifications'
import { Contacts } from '../pages/Contacts'
import { Subscriptions } from '../pages/Subscriptions'
import { Outreach } from '../pages/Outreach'
import { Spending } from '../pages/Spending'
import { LeadsFinder } from '../pages/LeadsFinder'
import { Reports } from '../pages/Reports'
import { Receipts } from '../pages/Receipts'
import { Transactions } from '../pages/Transactions'
import { Ritmo } from '../pages/Ritmo'

/**
 * Branch de Dashboard baseado no perfil ativo.
 * Pessoal → Dashboard (finanças/hábitos).
 * Profissional → DashboardPro (pipeline/entregas/metas).
 */
export function ProfileDashboard() {
  const active = useProfileStore((s) => s.getActive())
  if (active?.type === 'professional') {
    return <DashboardPro />
  }
  return <Dashboard />
}

/** /notifications: Pessoal → Notifications | Profissional → Contacts */
export function ProfileNotifications() {
  const active = useProfileStore((s) => s.getActive())
  if (active?.type === 'professional') {
    return <Contacts />
  }
  return <Notifications />
}

/** /subscriptions: Pessoal → Subscriptions | Profissional → Outreach */
export function ProfileSubscriptions() {
  const active = useProfileStore((s) => s.getActive())
  if (active?.type === 'professional') {
    return <Outreach />
  }
  return <Subscriptions />
}

/** /spending: Pessoal → Spending | Profissional → LeadsFinder */
export function ProfileSpending() {
  const active = useProfileStore((s) => s.getActive())
  if (active?.type === 'professional') {
    return <LeadsFinder />
  }
  return <Spending />
}

/** /reports: Pessoal → Reports | Profissional → Receipts */
export function ProfileReports() {
  const active = useProfileStore((s) => s.getActive())
  if (active?.type === 'professional') {
    return <Receipts />
  }
  return <Reports />
}

/** /transactions: Pessoal → Transactions | Profissional → Ritmo */
export function ProfileTransactions() {
  const active = useProfileStore((s) => s.getActive())
  if (active?.type === 'professional') {
    return <Ritmo />
  }
  return <Transactions />
}