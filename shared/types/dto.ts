export type Bank = Pick<AppBank, 'id' | 'name'>

export type Account = Omit<
  AppAccount,
  'userId' | 'bankId' | 'createdAt' | 'updatedAt'
> & {
  bank: Bank | null
  balance: number
}

export type Transaction = Omit<
  AppTransaction,
  | 'userId'
  | 'accountId'
  | 'categoryId'
  | 'toAccountId'
  | 'transactionId'
  | 'assetId'
> & {
  account: Pick<AppAccount, 'id' | 'name'>
  category: Pick<AppCategory, 'id' | 'name'> | null
  toAccount: Pick<AppAccount, 'id' | 'name'> | null
  transaction: Pick<AppTransaction, 'id' | 'name'> | null
  asset: Pick<AppAsset, 'id' | 'name'> | null
}

export type Category = Omit<
  AppCategory,
  'userId' | 'createdAt' | 'updatedAt' | 'parentId'
>

export type Asset = Omit<AppAsset, 'userId' | 'value'> & {
  accounts: { id: string; name: string; bankName: string | null }[]
  currentValue: number
  costBasis: number
  profit: number
  profitPercent: number | null
}

export type PortfolioAssetEntry = Pick<
  AppPortfolioAsset,
  'id' | 'allocatedAmount' | 'targetPercent' | 'maxDeviation'
> & {
  asset: Pick<AppAsset, 'id' | 'name' | 'type'>
  effectiveValue: number
  actualPercent: number
  drift: number | null
  isDrifting: boolean
}

export type Portfolio = Omit<AppPortfolio, 'userId'> & {
  assets: PortfolioAssetEntry[]
  totalValue: number
}

export type AssetSnapshot = Omit<AppAssetSnapshot, 'assetId' | 'value'> & {
  value: number
  vsPrev: number | null
  vsPrevPercent: number | null
  vsFirst: number | null
  vsFirstPercent: number | null
}

export type AssetPurchase = Pick<
  AppTransaction,
  'id' | 'name' | 'type' | 'amount' | 'quantity' | 'date' | 'description'
> & {
  account: Pick<AppAccount, 'id' | 'name'>
}
