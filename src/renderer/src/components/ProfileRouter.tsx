import { useProfileStore } from '../store/useProfile'
import { Dashboard } from '../pages/Dashboard'
import { DashboardPro } from '../pages/DashboardPro'

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