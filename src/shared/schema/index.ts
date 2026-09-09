// KUXY schema barrel
// Re-exporta todas as tabelas e tipos pra manter compatibilidade
// com imports existentes: `import * as schema from '../shared/schema'`.
//
// Cada arquivo aqui corresponde a um módulo funcional do app.
// Adicionar uma tabela nova? Cria um arquivo novo + export aqui.

export * from './profiles'
export * from './habits'
export * from './routines'
export * from './journal'
export * from './focus'
export * from './projects'
export * from './contacts'
export * from './goals'
export * from './leads'
export * from './finance'
export * from './ritmo'
export * from './sidebar'
export * from './seeds'
