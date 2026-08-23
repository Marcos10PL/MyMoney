import type { H3Event } from 'h3'
import { and, desc, eq, inArray, isNotNull, isNull, ne, sql } from 'drizzle-orm'
import { db, type DB } from '~~/server/db/conn'
import {
  assetAccounts,
  assets,
  assetSnapshots,
  portfolioAssets,
  transactions,
} from '~~/server/db/schema'

export const getEventContext = (event: H3Event) => {
  return event.context.userSession
}

export const computeAccountBalances = async (
  userId: string
): Promise<Record<string, number>> => {
  const userTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))

  const balances: Record<string, number> = {}

  for (const tx of userTransactions) {
    const amount = parseFloat(tx.amount) || 0
    const accId = tx.accountId

    if (!balances[accId]) balances[accId] = 0

    if (tx.type === TRANSACTION_TYPES.INCOME) {
      balances[accId] += amount
    } else if (tx.type === TRANSACTION_TYPES.EXPENSE) {
      balances[accId] -= amount
    } else if (tx.type === TRANSACTION_TYPES.LOAN_GIVEN) {
      balances[accId] -= amount
    } else if (tx.type === TRANSACTION_TYPES.LOAN_RETURNED) {
      balances[accId] += amount
    } else if (tx.type === TRANSACTION_TYPES.TRANSFER) {
      if (tx.toAccountId) {
        balances[accId] -= amount
      } else {
        balances[accId] += amount
      }
    } else if (tx.type === TRANSACTION_TYPES.INVESTMENT_BUY) {
      balances[accId] -= amount
    } else if (tx.type === TRANSACTION_TYPES.INVESTMENT_SELL) {
      balances[accId] += amount
    }
  }

  return balances
}

export const upsertAssetSnapshot = async (
  assetId: string,
  value: number,
  date?: string,
  dbOrTx: DB = db
): Promise<void> => {
  const d = date ?? new Date().toISOString().split('T')[0]!
  await dbOrTx
    .insert(assetSnapshots)
    .values({ assetId, value: String(value), date: d })
    .onConflictDoUpdate({
      target: [assetSnapshots.assetId, assetSnapshots.date],
      set: { value: sql`excluded.value` },
    })
}

export const syncAssetValue = async (
  assetId: string,
  dbOrTx: DB
): Promise<void> => {
  const [latest] = await dbOrTx
    .select({ value: assetSnapshots.value })
    .from(assetSnapshots)
    .where(eq(assetSnapshots.assetId, assetId))
    .orderBy(desc(assetSnapshots.date))
    .limit(1)

  await dbOrTx
    .update(assets)
    .set({ value: latest?.value ?? '0' })
    .where(eq(assets.id, assetId))
}

export const getAssetsCostBasis = async (
  assetIds: string[],
  userId: string
): Promise<Map<string, number>> => {
  const costBasisByAsset = new Map<string, number>()
  if (assetIds.length === 0) return costBasisByAsset

  const rows = await db
    .select({
      assetId: transactions.assetId,
      costBasis: sql<string>`COALESCE(SUM(CASE
        WHEN ${transactions.type} = 'investment_buy' THEN ${transactions.amount}::numeric
        WHEN ${transactions.type} = 'investment_sell' THEN -${transactions.amount}::numeric
        ELSE 0
      END), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        isNotNull(transactions.assetId),
        inArray(transactions.assetId, assetIds)
      )
    )
    .groupBy(transactions.assetId)

  for (const row of rows) {
    if (row.assetId)
      costBasisByAsset.set(row.assetId, parseFloat(row.costBasis))
  }
  return costBasisByAsset
}

export const toValueEquivalent = (
  rawAmount: number,
  allocationMode: AppAllocationMode,
  costBasis: number,
  currentValue: number
): number => {
  if (allocationMode !== ALLOCATION_MODES.COST) return rawAmount
  return costBasis > 0 ? (rawAmount / costBasis) * currentValue : rawAmount
}

export const toCostEquivalent = (
  rawAmount: number,
  allocationMode: AppAllocationMode,
  costBasis: number,
  currentValue: number
): number => {
  if (allocationMode === ALLOCATION_MODES.COST) return rawAmount
  return currentValue > 0 ? (rawAmount / currentValue) * costBasis : rawAmount
}

export type AllocationEntry = {
  assetId: string
  allocatedAmount: string | null
  allocationMode: AppAllocationMode
}

export const sumExplicitAllocations = (
  rows: AllocationEntry[],
  costBasisByAsset: Map<string, number>,
  currentValueByAsset: Map<string, number>
): { byValue: Map<string, number>; byCost: Map<string, number> } => {
  const byValue = new Map<string, number>()
  const byCost = new Map<string, number>()

  for (const row of rows) {
    if (row.allocatedAmount == null) continue
    const raw = parseFloat(row.allocatedAmount)
    const costBasis = costBasisByAsset.get(row.assetId) ?? 0
    const currentValue = currentValueByAsset.get(row.assetId) ?? 0
    const valueEquivalent = toValueEquivalent(
      raw,
      row.allocationMode,
      costBasis,
      currentValue
    )
    const costEquivalent = toCostEquivalent(
      raw,
      row.allocationMode,
      costBasis,
      currentValue
    )
    byValue.set(row.assetId, (byValue.get(row.assetId) ?? 0) + valueEquivalent)
    byCost.set(row.assetId, (byCost.get(row.assetId) ?? 0) + costEquivalent)
  }

  return { byValue, byCost }
}

export const resolveRemainingValue = (
  allocationMode: AppAllocationMode,
  costBasis: number,
  currentValue: number,
  explicitValue: number,
  explicitCost: number
): number => {
  if (allocationMode === ALLOCATION_MODES.COST) {
    return toValueEquivalent(
      Math.max(0, costBasis - explicitCost),
      ALLOCATION_MODES.COST,
      costBasis,
      currentValue
    )
  }
  return Math.max(0, currentValue - explicitValue)
}

export const validateAllocation = async (
  assetId: string,
  allocatedAmount: number | null,
  allocationMode: AppAllocationMode,
  userId: string,
  excludePaId?: string
): Promise<void> => {
  if (allocatedAmount == null) {
    const [existingNull] = await db
      .select()
      .from(portfolioAssets)
      .where(
        excludePaId
          ? and(
              eq(portfolioAssets.assetId, assetId),
              isNull(portfolioAssets.allocatedAmount),
              ne(portfolioAssets.id, excludePaId)
            )
          : and(
              eq(portfolioAssets.assetId, assetId),
              isNull(portfolioAssets.allocatedAmount)
            )
      )
      .limit(1)

    if (existingNull)
      throw createError({
        statusCode: 422,
        message: 'Asset already has an unallocated entry in another portfolio',
      })
    return
  }

  const [[asset], costBasisMap, existingRows] = await Promise.all([
    db
      .select()
      .from(assets)
      .where(and(eq(assets.id, assetId), eq(assets.userId, userId)))
      .limit(1),
    getAssetsCostBasis([assetId], userId),
    db
      .select({
        allocatedAmount: portfolioAssets.allocatedAmount,
        allocationMode: portfolioAssets.allocationMode,
      })
      .from(portfolioAssets)
      .where(
        excludePaId
          ? and(
              eq(portfolioAssets.assetId, assetId),
              isNotNull(portfolioAssets.allocatedAmount),
              ne(portfolioAssets.id, excludePaId)
            )
          : and(
              eq(portfolioAssets.assetId, assetId),
              isNotNull(portfolioAssets.allocatedAmount)
            )
      ),
  ])

  if (!asset) throw createError({ statusCode: 404, message: 'Asset not found' })

  const manual = parseFloat(asset.value) || 0
  let currentValue = manual

  if (manual === 0) {
    const linkedAccounts = await db
      .select({ accountId: assetAccounts.accountId })
      .from(assetAccounts)
      .where(eq(assetAccounts.assetId, assetId))

    if (linkedAccounts.length > 0) {
      const balances = await computeAccountBalances(userId)
      currentValue = linkedAccounts.reduce(
        (sum, { accountId }) => sum + (balances[accountId] ?? 0),
        0
      )
    }
  }

  const costBasis = costBasisMap.get(assetId) ?? 0

  const newValueEquivalent = toValueEquivalent(
    allocatedAmount,
    allocationMode,
    costBasis,
    currentValue
  )

  const existingAllocated = existingRows.reduce((sum, row) => {
    const raw = parseFloat(row.allocatedAmount!) || 0
    return (
      sum + toValueEquivalent(raw, row.allocationMode, costBasis, currentValue)
    )
  }, 0)

  if (existingAllocated + newValueEquivalent > currentValue + 0.005) {
    throw createError({
      statusCode: 422,
      message: 'Allocated amount exceeds asset value',
    })
  }
}

export const validateGainWeight = async (
  assetId: string,
  gainWeight: number | null,
  excludePaId?: string
): Promise<void> => {
  if (gainWeight == null) return

  const [sumResult] = await db
    .select({
      existingSum: sql<string>`coalesce(sum(${portfolioAssets.gainWeight}), '0')`,
    })
    .from(portfolioAssets)
    .where(
      excludePaId
        ? and(
            eq(portfolioAssets.assetId, assetId),
            isNotNull(portfolioAssets.gainWeight),
            ne(portfolioAssets.id, excludePaId)
          )
        : and(
            eq(portfolioAssets.assetId, assetId),
            isNotNull(portfolioAssets.gainWeight)
          )
    )

  const existingSum = parseFloat(sumResult?.existingSum ?? '0')
  if (existingSum + gainWeight > 100 + 0.005) {
    throw createError({
      statusCode: 422,
      message: 'Total gain weight across portfolios cannot exceed 100%',
    })
  }
}

export const NONE_KEY = '__none__'

export const categoryStats = (
  map: Map<string, number>,
  categoriesMap: Record<string, string>,
  total: number
): CategoryStat[] => {
  return [...map.entries()]
    .map(([id, amount]) => ({
      categoryId: id === NONE_KEY ? null : id,
      name: categoriesMap[id] ?? 'Bez kategorii',
      total: amount,
      percent: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

export const modalCloseAnimation = () =>
  new Promise((resolve) => setTimeout(resolve, 200))
