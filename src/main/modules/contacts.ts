// KUXY main process — contacts module
// CRUD de contatos.

import { registerCrud } from './registerCrud'
import * as schema from '../../shared/schema'

export function registerContacts(persistDb: () => void): void {
  registerCrud({
    prefix: 'contacts',
    table: schema.contacts,
    hasUpdatedAt: true,
    persistDb,
  })
}
