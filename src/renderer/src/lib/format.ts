/**
 * Formatação monetária brasileira.
 *
 * Aceita valor em reais (float) e devolve "R$ 1.234,56".
 * Aceita valor em centavos (int) se passado como integer (compat com Finance.tsx).
 */
export function fmtBRL(value: number): string {
  const reais = Math.abs(value) >= 1000 ? value : value / 100
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(reais)
}

/**
 * Formata número compacto (1.2K, 3.4M) — usado em alguns lugares do dashboard.
 */
export function fmtCompact(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(n)
}