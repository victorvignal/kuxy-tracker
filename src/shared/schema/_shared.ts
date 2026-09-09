// KUXY schema — shared imports
// Tipos do drizzle compartilhados entre os arquivos do schema/
// Mantém barrel limpo e evita repetir imports em cada arquivo de tabela.

import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'

export { sqliteTable, text, integer, primaryKey }
