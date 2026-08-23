import type { InferSelectModel } from 'drizzle-orm'
import type {
  accounts,
  assetAccounts,
  assetSnapshots,
  assets,
  banks,
  categories,
  portfolioAssets,
  portfolios,
  transactions,
  users,
} from '../../server/db/schema'

// entities
export type AppUser = InferSelectModel<typeof users>
export type AppBank = InferSelectModel<typeof banks>
export type AppAccount = InferSelectModel<typeof accounts>
export type AppCategory = InferSelectModel<typeof categories>
export type AppTransaction = InferSelectModel<typeof transactions>
export type AppAsset = InferSelectModel<typeof assets>
export type AppAssetAccount = InferSelectModel<typeof assetAccounts>
export type AppPortfolio = InferSelectModel<typeof portfolios>
export type AppPortfolioAsset = InferSelectModel<typeof portfolioAssets>
export type AppAssetSnapshot = InferSelectModel<typeof assetSnapshots>

// enums
export type AppUserRoles = AppUser['role']
export type AppAccountType = AppAccount['type']
export type AppAccountDuration = AppAccount['duration']
export type AppCategoryType = AppCategory['type']
export type AppTransactionType = AppTransaction['type']
export type AppAssetType = AppAsset['type']
export type AppAllocationMode = AppPortfolioAsset['allocationMode']
