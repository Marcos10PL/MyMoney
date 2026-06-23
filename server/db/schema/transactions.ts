import {
  type AnyPgColumn,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { accounts } from './accounts'
import { categories } from './categories'

export const transactionTypeEnum = pgEnum('transaction_type', [
  'income',
  'expense',
  'transfer',
  'loan_given',
  'loan_returned',
])

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    name: text('name').notNull(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),

    // for transfer
    toAccountId: uuid('to_account_id').references(() => accounts.id, {
      onDelete: 'set null',
    }),

    // for loan_returned
    transactionId: uuid('transaction_id').references(
      (): AnyPgColumn => transactions.id,
      {
        onDelete: 'set null',
      }
    ),

    // for loan_given / loan_returned
    counterparty: text('counterparty'),

    type: transactionTypeEnum('type').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    description: text('description'),

    date: timestamp('date', { withTimezone: true }).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index('transactions_user_id_idx').on(t.userId),
    index('transactions_account_id_idx').on(t.accountId),
    index('transactions_category_id_idx').on(t.categoryId),
    index('transactions_date_idx').on(t.date),
    index('transactions_type_idx').on(t.type),
  ]
)
