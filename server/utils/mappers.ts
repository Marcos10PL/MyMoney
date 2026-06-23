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
  tx: AppTransaction,
  account: AppAccount,
  category: AppCategory | null,
  toAccount: AppAccount | null,
  transaction: AppTransaction | null
): Transaction => {
  return {
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    description: tx.description,
    name: tx.name,
    counterparty: tx.counterparty,

    date: new Date(tx.date),
    updatedAt: new Date(tx.updatedAt),
    createdAt: new Date(tx.createdAt),

    account: {
      id: account.id,
      name: account.name,
    },

    category: category
      ? {
          id: category.id,
          name: category.name,
        }
      : null,
    toAccount: toAccount
      ? {
          id: toAccount.id,
          name: toAccount.name,
        }
      : null,
    transaction: transaction
      ? {
          id: transaction.id,
          name: transaction.name,
        }
      : null,
  }
}
