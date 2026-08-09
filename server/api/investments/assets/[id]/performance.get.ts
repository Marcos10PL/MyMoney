import { and, asc, eq, inArray } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { assetSnapshots, transactions } from '~~/server/db/schema'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)

  await requireAsset(id, user.id)

  const [snapshotRows, txRows] = await Promise.all([
    db
      .select({ date: assetSnapshots.date, value: assetSnapshots.value })
      .from(assetSnapshots)
      .where(eq(assetSnapshots.assetId, id))
      .orderBy(asc(assetSnapshots.date)),
    db
      .select({
        type: transactions.type,
        amount: transactions.amount,
        date: transactions.date,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.id),
          eq(transactions.assetId, id),
          inArray(transactions.type, [
            TRANSACTION_TYPES.INVESTMENT_BUY,
            TRANSACTION_TYPES.INVESTMENT_SELL,
          ])
        )
      )
      .orderBy(asc(transactions.date)),
  ])

  return {
    success: true,
    message: 'Performance data fetched successfully',
    data: {
      snapshots: snapshotRows.map((r) => ({
        date: r.date,
        value: parseFloat(r.value),
      })),
      transactions: txRows.map((r) => ({
        date: new Date(r.date).toISOString().split('T')[0]!,
        type: r.type,
        amount: parseFloat(r.amount),
      })),
    },
  } satisfies APIResponse<AssetPerformanceData>
})
