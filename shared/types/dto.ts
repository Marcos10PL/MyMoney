export type Bank = Pick<AppBank, 'id' | 'name'>

export type Account = Omit<
  AppAccount,
  'userId' | 'bankId' | 'createdAt' | 'updatedAt'
> & {
  bank: Bank | null
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
