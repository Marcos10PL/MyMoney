import {
  type AnyPgColumn,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const categoryTypeEnum = pgEnum('category_type', ['income', 'expense'])

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),

    // for future
    parentId: uuid('parent_id').references((): AnyPgColumn => categories.id),

    name: text('name').notNull().unique(),
    type: categoryTypeEnum('type').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index('categories_user_id_idx').on(t.userId),
    index('categories_parent_id_idx').on(t.parentId),
    index('categories_type_idx').on(t.type),
  ]
)
