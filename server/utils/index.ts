import type { H3Event } from 'h3'
import { eq, sql } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { assetSnapshots, transactions } from '~~/server/db/schema'

export const getEventContext = (event: H3Event) => {
  return event.context.userSession
}

export const computeAccountBalances = async (
  userId: string
): Promise<Record<string, number>> => {
  const txs = await db
    .select({
      accountId: transactions.accountId,
      toAccountId: transactions.toAccountId,
      type: transactions.type,
      amount: transactions.amount,
    })
    .from(transactions)
    .where(eq(transactions.userId, userId))

  const balances: Record<string, number> = {}

  for (const tx of txs) {
    const amount = parseFloat(tx.amount) || 0
    const acc = tx.accountId
    if (!balances[acc]) balances[acc] = 0

    if (tx.type === TRANSACTION_TYPES.INCOME) {
      balances[acc] += amount
    } else if (tx.type === TRANSACTION_TYPES.EXPENSE) {
      balances[acc] -= amount
    } else if (tx.type === TRANSACTION_TYPES.LOAN_GIVEN) {
      balances[acc] -= amount
    } else if (tx.type === TRANSACTION_TYPES.LOAN_RETURNED) {
      balances[acc] += amount
    } else if (tx.type === TRANSACTION_TYPES.TRANSFER) {
      if (tx.toAccountId) {
        balances[acc] -= amount
      } else {
        balances[acc] += amount
      }
    } else if (tx.type === TRANSACTION_TYPES.INVESTMENT_BUY) {
      balances[acc] -= amount
    } else if (tx.type === TRANSACTION_TYPES.INVESTMENT_SELL) {
      balances[acc] += amount
    }
  }

  return balances
}

export const upsertAssetSnapshot = async (
  assetId: string,
  value: number,
  date?: string
): Promise<void> => {
  const d = date ?? new Date().toISOString().split('T')[0]!
  await db
    .insert(assetSnapshots)
    .values({ assetId, value: String(value), date: d })
    .onConflictDoUpdate({
      target: [assetSnapshots.assetId, assetSnapshots.date],
      set: { value: sql`excluded.value` },
    })
}

export const NONE_KEY = '__none__'

export const categoryStats = (
  map: Map<string, number>,
  categoriesMap: Record<string, string>,
  totalCount: number
) => {
  return [...map.entries()]
    .filter(([key]) => key !== NONE_KEY)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([key, total]) => ({
      categoryId: key === NONE_KEY ? null : key,
      name:
        key === NONE_KEY
          ? 'Bez kategorii (nie liczone globalnie)'
          : (categoriesMap[key] ?? 'Nieznana'),
      total,
      percent: totalCount > 0 ? Math.round((total / totalCount) * 100) : 0,
    }))
}
