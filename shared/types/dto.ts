export type Account = Omit<AppAccount, 'userId' | 'bankId'> & {
  bank: Pick<AppBank, 'id' | 'name'> | null
}

export type Transaction = Omit<
  AppTransaction,
  'userId' | 'accountId' | 'categoryId' | 'toAccountId'
> & {
  account: Pick<AppAccount, 'id' | 'name'>
  category: Pick<AppCategory, 'id' | 'name'> | null
  toAccount: Pick<AppAccount, 'id' | 'name'> | null
}

export type Category = Omit<AppCategory, 'userId' | 'deletedAt'> & {
  parent: Pick<AppCategory, 'id' | 'name'> | null
}
