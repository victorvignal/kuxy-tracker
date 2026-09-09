import type { NewCategory } from './finance'

/**
 * Categorias seed do módulo Finance. Criadas automaticamente no db.ts
 * caso a tabela esteja vazia pro perfil ativo. Sem isso o usuário
 * começaria com zero categorias e teria que criar tudo na mão.
 */
export const DEFAULT_CATEGORIES: Array<Pick<NewCategory, 'name' | 'type' | 'color' | 'icon'>> = [
  // Receitas
  { name: 'Salário', type: 'income', color: '#4ade80', icon: 'briefcase' },
  { name: 'Freelance', type: 'income', color: '#22d3ee', icon: 'laptop' },
  { name: 'Investimentos', type: 'income', color: '#a78bfa', icon: 'trending-up' },
  // Despesas
  { name: 'Moradia', type: 'expense', color: '#8b5cf6', icon: 'home' },
  { name: 'Alimentação', type: 'expense', color: '#f87171', icon: 'utensils' },
  { name: 'Transporte', type: 'expense', color: '#facc15', icon: 'car' },
  { name: 'Saúde', type: 'expense', color: '#22d3ee', icon: 'heart-pulse' },
  { name: 'Lazer', type: 'expense', color: '#c084fc', icon: 'gamepad-2' },
  { name: 'Educação', type: 'expense', color: '#6d4ee0', icon: 'book-open' },
  { name: 'Assinaturas', type: 'expense', color: '#a78bfa', icon: 'repeat' }
]
