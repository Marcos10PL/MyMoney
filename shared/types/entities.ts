import type { InferSelectModel } from 'drizzle-orm'
import type {
  accounts,
  banks,
  categories,
  transactions,
  users,
} from '../../server/db/schema'

// entities
export type AppUser = InferSelectModel<typeof users>
export type AppBank = InferSelectModel<typeof banks>
export type AppAccount = InferSelectModel<typeof accounts>
export type AppCategory = InferSelectModel<typeof categories>
export type AppTransaction = InferSelectModel<typeof transactions>

// enums
export type AppUserRoles = AppUser['role']
export type AppAccountType = AppAccount['type']
export type AppAccountDuration = AppAccount['duration']
export type AppCategoryType = AppCategory['type']
export type AppTransactionType = AppTransaction['type']
