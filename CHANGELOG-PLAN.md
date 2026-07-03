# KUXY — Status Atual & Próximos Planos

> Atualizado em 2026-07-03. Histórico de releases + roadmap.

---

## 📦 Mudanças recentes (v0.8.0 → v0.10.0)

### v0.8.0 — 2026-07-01
- Settings hub + runtime accent override
- Sidebar com multi-profile workspaces
- 21 páginas reescritas baseadas em templates de design

### v0.8.1 — 2026-07-01
- i18n EN para módulo Projects (40+ chaves que faltavam)
- Sidebar cleanup
- Default profile data substituído por dados reais do profile ativo

### v0.8.2 — 2026-07-02
- Topbar com `-webkit-app-region: drag` (arrastável no Windows)
- Ícones duplicados (Calendar=Timer) trocados por CalendarDays + Clock4
- TransactionDialog feedback quando faltam campos

### v0.8.3 — 2026-07-02
- Sidebar scroll (`overflow-y-auto`)
- Legacy section escondida por padrão (filtra defaults antigos)
- Calendar ganha botão Add (reusa NewHabitDialog)
- TransactionDialog: hint "crie uma conta primeiro..." se accounts vazio

### v0.8.4 — 2026-07-03
- ContactDialog extraído pra `components/contacts/` (396 → 223 linhas)
- **v0.9.0**: Contacts CRUD completo (schema + 5 IPC + preload + hook + UI)
- Sidebar: scroll + legacy filter já estavam

### v0.9.0 — 2026-07-03
- **Contacts**: CRUD real persistido em DB (substituiu mock de v0.4–v0.8.x)
- Tabela `contacts` no schema, 5 IPC handlers, hook `useContacts`, dialog extraído
- 14 chaves i18n `contacts.*` EN+PT

### v0.10.0 — 2026-07-03
- **Leads Finder**: integração real YouTube Data API v3
- Backend: `src/main/youtube.ts` (key mgmt, scoring, mock fallback)
- Tabela `leads` + 5 IPC handlers
- Hook `useLeads` + LeadsFinder.tsx reescrito (banner + busca real + filtros)
- 36 chaves i18n `leads.*` EN+PT
- YouTube API key em `~/.kuxy/config.json` como `{"youtubeApiKey": "AIza..."}`
- ⚠️ **Hotfix**: rebuildado com `out/` corrigido no app.asar (electron-builder 25 bug)

---

## 🔧 Fixes de infraestrutura aplicados

- **Workflow de release** (`fc55fbe`): aceita tags `v*` + `kuxy-v*`, corrige check de Windows artifact
- **electron-builder.yml** (`7e68eef`): simplificado `files:` + `asarUnpack` agora só pra `.node`/`.dll`
- **scripts/build-repack.mjs** (`904f1b5`): workaround pro bug do electron-builder que dropa `out/` do asar
- **npm script `release:win`**: encadeia vite build → electron-builder dir → repack → NSIS

---

## 📋 Próximos planos

### Curto prazo (v0.10.1 / v0.10.2 — bugfixes pequenos)
- [ ] Adicionar key do YouTube e testar busca real
- [ ] Validar: `outreach` ainda é placeholder (v0.10.x?)
- [ ] Validar: earnings (criar transação → atualizar lista?)
- [ ] Adicionar mais validações no TransactionDialog (negativos, decimais)

### Médio prazo (v0.11.0 — features)
- [ ] **Earnings lê de DB**: substituir SOURCES hardcoded por query `transactions WHERE type='income' GROUP BY category`
- [ ] **Outreach**: CRUD real (atualmente é placeholder)
- [ ] **Receipts export**: botão "Gerar recibo" deve gerar PDF (atualmente é só UI)
- [ ] **Habit completions UI**: clicar no dia do Calendar deve togglear completion

### Longo prazo (v0.12+ — refactor & qualidade)
- [ ] **Split i18n em JSON files**: substituir `i18n.ts` monolítico (980 linhas) por `locales/en.json` + `locales/pt-BR.json`
- [ ] **Generic CRUD helper em main/index.ts**: 69 ipcMain.handle → ~30 (helper `registerCrud`)
- [ ] **Split main/index.ts** (845 linhas) em módulos: `accounts.ts`, `leads.ts`, `youtube.ts`, etc
- [ ] **Schema split**: `schema/` directory com um arquivo por tabela
- [ ] **Type augmentation** pra `window.api` (substituir `any` por tipos reais do preload)

### Backlog (sem prazo)
- [ ] Dark/light theme toggle (já tem ThemeProvider, falta UI)
- [ ] Keyboard shortcuts globais (Cmd+K já existe no Topbar, mas só foca search)
- [ ] Backup/restore do DB local
- [ ] Sync com cloud (se virar SaaS, opcional)
- [ ] Notificações nativas (já tem Notification, falta integração com eventos)
- [ ] Mobile app (React Native? Flutter?)

---

## 🐛 Bugs conhecidos (não críticos)

- **electron-builder 25 + `files:` customizado**: dropa `out/` do asar. Workaround via `build-repack.mjs`. Fix real requer update de electron-builder.
- **drizzle/mysql types**: erros de lint em `node_modules/drizzle-orm/mysql-core` (não afeta build, mas polui output)
- **tsconfig.tsbuildinfo** aparecendo no asar (cosmético, +alguns KB)
- **Topbar Add button** sumia em algumas rotas (Calendar/Projects já tem, outras não)

---

## 📊 Métricas de código

| métrica | valor |
|---|---|
| Linhas em `src/` | ~22.000 |
| Maior arquivo | `src/renderer/src/lib/i18n.ts` (980 linhas, monolítico) |
| Tabelas no DB | 17 (profiles, habits, completions, routines, journal, focus, projects + 5, accounts, categories, transactions, subscriptions, budgets, contacts, leads) |
| IPC handlers | 69 |
| Páginas | 18 |
| Componentes | 58 |
| Hooks custom | 3 (useFinanceData, useContacts, useLeads) |
| Idiomas | 2 (EN, PT-BR) |
| Última release | v0.10.0 (2026-07-03) |
| Última tag | v0.10.0 |
