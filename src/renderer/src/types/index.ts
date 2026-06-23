export type ProfileType = 'personal' | 'professional' | 'custom'

export interface Profile {
  id: number
  name: string
  slug: ProfileType | string
  type: ProfileType
  color: string
  icon: string
  description: string | null
  sidebarItems: string[] // paths permitidos na sidebar
  archived: boolean
  createdAt: number | Date
}

export type Recurrence =
  | { type: 'daily' }
  | { type: 'weekly'; days: number[] }
  | { type: 'interval'; days: number }
  | { type: 'weekly_count'; count: number }

export interface Habit {
  id: number
  name: string
  description: string | null
  icon: string
  color: string
  category: string | null
  recurrence: string
  target: number
  unit: string | null
  archived: boolean
  createdAt: number | Date
  updatedAt: number | Date
}

export interface Completion {
  habitId: number
  date: string
  count: number
  value: number
  note: string | null
  createdAt: number | Date
}

export interface Routine {
  id: number
  name: string
  description: string | null
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime'
  archived: boolean
  createdAt: number | Date
}

export interface JournalEntry {
  id: number
  date: string
  mood: number | null
  energy: number | null
  content: string | null
  createdAt: number | Date
  updatedAt: number | Date
}

export interface FocusSession {
  id: number
  habitId: number | null
  duration: number
  startedAt: number | Date
  completedAt: number | Date | null
  status: 'running' | 'completed' | 'aborted'
}

// ============================================================
// FINANCE (v0.3.0)
// ============================================================

export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'cash'

export interface Account {
  id: number
  name: string
  type: AccountType
  balance: number // centavos
  currency: string
  color: string
  icon: string
  archived: boolean
  createdAt: number | Date
  updatedAt: number | Date
}

export interface Category {
  id: number
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
  archived: boolean
  createdAt: number | Date
}

export interface Transaction {
  id: number
  accountId: number
  categoryId: number
  type: 'income' | 'expense'
  amount: number // centavos (sempre positivo)
  description: string
  date: string // YYYY-MM-DD
  notes: string | null
  createdAt: number | Date
  updatedAt: number | Date
}

export type SubscriptionInterval = 'monthly' | 'yearly' | 'weekly'

export interface Subscription {
  id: number
  accountId: number | null
  categoryId: number | null
  name: string
  amount: number // centavos
  currency: string
  interval: SubscriptionInterval
  nextBilling: string // YYYY-MM-DD
  active: boolean
  notes: string | null
  createdAt: number | Date
}

// ============================================================
// PROJECTS (v0.4.0)
// ============================================================

export type ProjectStatus = 'todo' | 'in_progress' | 'in_review' | 'completed'
export type ProjectPriority = 1 | 2 | 3

export interface Project {
  id: number
  emoji: string | null
  name: string
  client: string | null
  description: string | null
  status: ProjectStatus
  priority: ProjectPriority
  progress: number // 0-100
  sortOrder: number
  dueDate: string | null
  person: string | null
  youtubeUrl: string | null
  googleDriveUrl: string | null
  tiktokUrl: string | null
  notes: string | null
  archived: boolean
  createdAt: number | Date
  updatedAt: number | Date
}

export interface ProjectMember {
  id: number
  projectId: number
  name: string
  initials: string | null
  color: string
}

export interface ProjectTag {
  id: number
  projectId: number
  label: string
  color: string
}

export interface ProjectComment {
  id: number
  projectId: number
  author: string
  content: string
  createdAt: number | Date
}

export type ProjectSubitemStatus = 'idea' | 'working' | 'editor' | 'done'

export interface ProjectSubitem {
  id: number
  projectId: number
  name: string
  thumbnailUrl: string | null
  status: ProjectSubitemStatus
  dueDate: string | null
  postDate: string | null
  sortOrder: number
  createdAt: number | Date
}