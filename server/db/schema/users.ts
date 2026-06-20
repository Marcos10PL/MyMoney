import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const roleEnum = pgEnum('roles', ['admin']) // maybe for future use

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    login: varchar('login', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),

    role: roleEnum('role').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    index('users_deleted_at_idx')
      .on(t.deletedAt)
      .where(sql`deleted_at IS NULL`),
    index('users_role_idx').on(t.role),
  ]
)
