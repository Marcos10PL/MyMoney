import { index, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'

export const banks = pgTable(
  'banks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
  },
  (t) => [
    index('banks_user_id_idx').on(t.userId),
    unique('banks_user_id_name_unique').on(t.userId, t.name),
  ]
)
