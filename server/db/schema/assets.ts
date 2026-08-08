import {
  index,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { accounts } from './accounts'

export const assetTypesEnum = pgEnum('asset_types', [
  'bonds',
  'etf',
  'stocks',
  'gold',
  'real_estate',
  'crypto',
  'cash',
  'other',
])

export const assets = pgTable(
  'assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),

    name: text('name').notNull(),
    type: assetTypesEnum('type').notNull(),
    value: numeric('value', { precision: 15, scale: 2 }).notNull().default('0'),
    currency: text('currency').notNull().default('PLN'),
    description: text('description'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [index('assets_user_id_idx').on(t.userId)]
)

export const assetAccounts = pgTable(
  'asset_accounts',
  {
    assetId: uuid('asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.assetId, t.accountId] }),
    index('asset_accounts_asset_id_idx').on(t.assetId),
  ]
)
