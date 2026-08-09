import {
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { assets } from './assets'

export const portfolios = pgTable(
  'portfolios',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),

    name: text('name').notNull(),
    description: text('description'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [index('portfolios_user_id_idx').on(t.userId)]
)

export const portfolioAssets = pgTable(
  'portfolio_assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    portfolioId: uuid('portfolio_id')
      .notNull()
      .references(() => portfolios.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'cascade' }),

    // how much of this asset is allocated to this portfolio
    allocatedAmount: numeric('allocated_amount', { precision: 15, scale: 2 }),

    // target allocation within the portfolio (0-100)
    targetPercent: numeric('target_percent', { precision: 5, scale: 2 }),
    // acceptable deviation in percentage points, e.g. 3 means ±3%
    maxDeviation: numeric('max_deviation', { precision: 5, scale: 2 }),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index('portfolio_assets_portfolio_id_idx').on(t.portfolioId),
    unique('portfolio_assets_portfolio_asset_unique').on(
      t.portfolioId,
      t.assetId
    ),
  ]
)
