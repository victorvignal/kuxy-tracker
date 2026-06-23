import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './pages/Dashboard'
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
import { Placeholder } from './pages/Placeholder'
import { Contacts } from './pages/Contacts'
import {
  IconNotification,
  IconEarnings,
  IconSpending,
  IconSubscriptions,
  IconReports,
  IconTransactions,
  IconPerformance,
  IconMoreDots,
  IconHelp,
  IconFeedback
} from './components/template-icons/TemplateIcon'
import { ThemeProvider } from './design/ThemeProvider'

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />

          {/* Itens do template Pessoal Dashboard */}
          <Route
            path="/notifications"
            element={
              <Placeholder
                titleKey="nav.notifications"
                Icon={<IconNotification size={28} color="var(--color-text-muted)" />}
              />
            }
          />
          <Route
            path="/earnings"
            element={
              <Placeholder
                titleKey="nav.earnings"
                Icon={<IconEarnings size={28} color="var(--color-text-muted)" />}
              />
            }
          />
          <Route
            path="/spending"
            element={
              <Placeholder
                titleKey="nav.spending"
                Icon={<IconSpending size={28} color="var(--color-text-muted)" />}
              />
            }
          />
          <Route
            path="/subscriptions"
            element={
              <Placeholder
                titleKey="nav.subscriptions"
                Icon={<IconSubscriptions size={28} color="var(--color-text-muted)" />}
              />
            }
          />
          <Route
            path="/reports"
            element={
              <Placeholder
                titleKey="nav.reports"
                Icon={<IconReports size={28} color="var(--color-text-muted)" />}
              />
            }
          />
          <Route
            path="/transactions"
            element={
              <Placeholder
                titleKey="nav.transactions"
                Icon={<IconTransactions size={28} color="var(--color-text-muted)" />}
              />
            }
          />
          <Route
            path="/performance"
            element={
              <Placeholder
                titleKey="nav.performance"
                Icon={<IconPerformance size={28} color="var(--color-text-muted)" />}
              />
            }
          />
          <Route
            path="/more"
            element={
              <Placeholder
                titleKey="nav.more"
                Icon={<IconMoreDots size={28} color="var(--color-text-muted)" />}
              />
            }
          />
          <Route path="/contacts" element={<Contacts />} />

          {/* General */}
          <Route
            path="/help"
            element={
              <Placeholder
                titleKey="nav.help"
                Icon={<IconHelp size={28} color="var(--color-text-muted)" />}
              />
            }
          />
          <Route
            path="/feedback"
            element={
              <Placeholder
                titleKey="nav.feedback"
                Icon={<IconFeedback size={28} color="var(--color-text-muted)" />}
              />
            }
          />

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