import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import {
  ProfileDashboard,
  ProfileNotifications,
  ProfileSubscriptions,
  ProfileSpending,
  ProfileReports,
  ProfileTransactions
} from './components/ProfileRouter'
import { Habits } from './pages/Habits'
import { Routines } from './pages/Routines'
import { Calendar } from './pages/Calendar'
import { Stats } from './pages/Stats'
import { Journal } from './pages/Journal'
import { Focus } from './pages/Focus'
import { Goals } from './pages/Goals'
import { Finance } from './pages/Finance'
import { Projects } from './pages/Projects'
import { Settings } from './pages/Settings'
import { Contacts } from './pages/Contacts'
import { Earnings } from './pages/Earnings'
import { Performance } from './pages/Performance'
import { More } from './pages/More'
import { Help } from './pages/Help'
import { Feedback } from './pages/Feedback'
import { ThemeProvider } from './design/ThemeProvider'

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<ProfileDashboard />} />

          {/* Itens do template Pessoal Dashboard — fazem branch por perfil */}
          <Route path="/notifications" element={<ProfileNotifications />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/spending" element={<ProfileSpending />} />
          <Route path="/subscriptions" element={<ProfileSubscriptions />} />
          <Route path="/reports" element={<ProfileReports />} />
          <Route path="/transactions" element={<ProfileTransactions />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/more" element={<More />} />
          <Route path="/contacts" element={<Contacts />} />

          {/* General */}
          <Route path="/help" element={<Help />} />
          <Route path="/feedback" element={<Feedback />} />

          {/* Rotas legadas (mantidas pra não quebrar deep links/breadcrumbs).
              Não aparecem na sidebar por default — só se o usuário adicionar
              explicitamente via customização de perfil. */}
          <Route path="/habits" element={<Habits />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/profiles" element={<Settings />} />
          <Route path="/settings/billing" element={<Settings />} />
          <Route path="/settings/profile" element={<Settings />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}