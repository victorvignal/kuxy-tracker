// KUXY main process — accounts module
// CRUD de contas financeiras.

import { registerCrud } from './registerCrud'
import * as schema from '../../shared/schema'

export function registerAccounts(persistDb: () => void): void {
  registerCrud({
    prefix: 'accounts',
    table: schema.accounts,
    hasUpdatedAt: true,
    persistDb,
  })
}
