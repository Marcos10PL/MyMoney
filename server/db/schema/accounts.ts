import {
  boolean,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { banks } from './banks'

export const accountTypesEnum = pgEnum('account_types', [
  'checking',
  'savings',
  'deposit',
  'investment',
  'wallet',
  'home',
  'other',
])

export const durationEnum = pgEnum('duration', ['indefinite', 'fixed'])

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    bankId: uuid('bank_id').references(() => banks.id, {
      onDelete: 'set null',
    }),

    name: text('name').notNull(),
    description: text('description'),
    type: accountTypesEnum('type').notNull(),
    percentage: numeric('percentage', { precision: 5, scale: 2 }),

    isFree: boolean('is_free').notNull().default(false),
    conditions: text('conditions'),

    startDate: timestamp('start_date', { withTimezone: true }).notNull(),

    duration: durationEnum('duration').notNull().default('indefinite'),
    durationEndDate: timestamp('duration_end_date', { withTimezone: true }),

    isActive: boolean('is_active').notNull().default(true),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('accounts_user_id_idx').on(table.userId),
    index('accounts_bank_id_idx').on(table.bankId),
  ]
)
