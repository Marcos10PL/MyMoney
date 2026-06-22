export const mapAccountToDTO = (
  account: AppAccount,
  bank: AppBank | null
): Account => {
  return {
    id: account.id,
    bank: bank
      ? {
          id: bank.id,
          name: bank.name,
        }
      : null,
    name: account.name,
    description: account.description,
    type: account.type,
    percentage: account.percentage !== null ? String(account.percentage) : null,
    isFree: account.isFree,
    conditions: account.conditions,
    startDate: new Date(account.startDate),
    duration: account.duration,
    durationEndDate: account.durationEndDate
      ? new Date(account.durationEndDate)
      : null,
    isActive: account.isActive,
  }
}

export const mapCategoryToDTO = (category: AppCategory): Category => {
  return {
    id: category.id,
    name: category.name,
    type: category.type,
  }
}

export const mapBankToDTO = (bank: AppBank): Bank => {
  return {
    id: bank.id,
    name: bank.name,
  }
}

export const mapTransactionToDTO = (
  transaction: AppTransaction,
  account: Pick<AppAccount, 'id' | 'name'>,
  category: Pick<AppCategory, 'id' | 'name'> | null,
  toAccount: Pick<AppAccount, 'id' | 'name'> | null
): Transaction => {
  return {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    name: transaction.name,
    counterparty: transaction.counterparty,
    account,
    category,
    toAccount,
    date: new Date(transaction.date),
    updatedAt: new Date(transaction.updatedAt),
    createdAt: new Date(transaction.createdAt),
  }
}
