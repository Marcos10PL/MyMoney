export const mapAssetToDTO = (
  asset: AppAsset,
  linkedAccounts: Array<AppAccount & { bankName: string | null }>,
  accountBalances: Record<string, number>,
  costBasis = 0
): Asset => {
  const manual = parseFloat(asset.value) || 0
  const accountsSum =
    linkedAccounts.length > 0
      ? linkedAccounts.reduce(
          (sum, acc) => sum + (accountBalances[acc.id] ?? 0),
          0
        )
      : 0
  const currentValue =
    manual > 0 ? manual : accountsSum > 0 ? accountsSum : costBasis

  const profit = costBasis > 0 ? currentValue - costBasis : 0
  const profitPercent = costBasis > 0 ? (profit / costBasis) * 100 : null

  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    currency: asset.currency,
    description: asset.description,
    createdAt: new Date(asset.createdAt),
    updatedAt: new Date(asset.updatedAt),
    accounts: linkedAccounts.map((a) => ({
      id: a.id,
      name: a.name,
      bankName: a.bankName,
    })),
    currentValue,
    costBasis,
    profit,
    profitPercent,
  }
}

export const mapPortfolioToDTO = (
  portfolio: AppPortfolio,
  entries: Array<{
    pa: AppPortfolioAsset
    asset: AppAsset
    currentValue: number
    remainingValue: number
    costBasis: number
  }>
): Portfolio => {
  const totalValue = entries.reduce((sum, { pa, remainingValue }) => {
    const effective =
      pa.allocatedAmount !== null
        ? parseFloat(pa.allocatedAmount) || 0
        : remainingValue
    return sum + effective
  }, 0)

  let totalCostBasis = 0
  let totalGain = 0

  const assets: PortfolioAssetEntry[] = entries.map(
    ({ pa, asset, currentValue, remainingValue, costBasis }) => {
      const effectiveValue =
        pa.allocatedAmount !== null
          ? parseFloat(pa.allocatedAmount) || 0
          : remainingValue
      const proportion = currentValue > 0 ? effectiveValue / currentValue : 1
      let entryCostBasis: number
      let entryGain: number
      if (pa.gainWeight !== null) {
        const w = Math.max(0, Math.min(100, parseFloat(pa.gainWeight))) / 100
        const totalAssetGain = costBasis > 0 ? currentValue - costBasis : 0
        entryCostBasis = w * costBasis
        entryGain = w * totalAssetGain
      } else {
        entryCostBasis = proportion * costBasis
        entryGain = entryCostBasis > 0 ? effectiveValue - entryCostBasis : 0
      }
      totalCostBasis += entryCostBasis
      totalGain += entryGain
      const entryGainPercent =
        entryCostBasis > 0 ? (entryGain / entryCostBasis) * 100 : null

      const actualPercent =
        totalValue > 0 ? (effectiveValue / totalValue) * 100 : 0
      const target =
        pa.targetPercent !== null ? parseFloat(pa.targetPercent) : null
      const maxDev =
        pa.maxDeviation !== null ? parseFloat(pa.maxDeviation) : null
      const drift = target !== null ? actualPercent - target : null
      const isDrifting =
        drift !== null && maxDev !== null && Math.abs(drift) > maxDev

      return {
        id: pa.id,
        asset: { id: asset.id, name: asset.name, type: asset.type },
        allocatedAmount: pa.allocatedAmount,
        targetPercent: pa.targetPercent,
        maxDeviation: pa.maxDeviation,
        gainWeight: pa.gainWeight,
        effectiveValue,
        costBasis: entryCostBasis,
        gain: entryGain,
        gainPercent: entryGainPercent,
        actualPercent,
        drift,
        isDrifting,
      }
    }
  )

  return {
    id: portfolio.id,
    name: portfolio.name,
    description: portfolio.description,
    createdAt: new Date(portfolio.createdAt),
    updatedAt: new Date(portfolio.updatedAt),
    assets,
    totalValue,
    totalCostBasis,
    totalGain,
  }
}

export const mapAccountToDTO = (
  account: AppAccount,
  bank: AppBank | null,
  balance = 0
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
    balance,
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
  transaction: AppTransaction | null,
  asset: AppAsset | null = null
): Transaction => {
  return {
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    quantity: tx.quantity,
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
    asset: asset
      ? {
          id: asset.id,
          name: asset.name,
        }
      : null,
  }
}
