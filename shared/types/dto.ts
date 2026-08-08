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
  'userId' | 'accountId' | 'categoryId' | 'toAccountId' | 'transactionId'
> & {
  account: Pick<AppAccount, 'id' | 'name'>
  category: Pick<AppCategory, 'id' | 'name'> | null
  toAccount: Pick<AppAccount, 'id' | 'name'> | null
  transaction: Pick<AppTransaction, 'id' | 'name'> | null
}

export type Category = Omit<
  AppCategory,
  'userId' | 'createdAt' | 'updatedAt' | 'parentId'
>

export type Asset = Omit<AppAsset, 'userId'> & {
  accounts: { id: string; name: string; bankName: string | null }[]
  currentValue: number
}

export type PortfolioAssetEntry = {
  id: string
  asset: Pick<AppAsset, 'id' | 'name' | 'type'>
  allocatedAmount: string | null
  targetPercent: string | null
  maxDeviation: string | null
  // computed
  effectiveValue: number
  actualPercent: number
  drift: number | null
  isDrifting: boolean
}

export type Portfolio = Omit<AppPortfolio, 'userId'> & {
  assets: PortfolioAssetEntry[]
  totalValue: number
}
