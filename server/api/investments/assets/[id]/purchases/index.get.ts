import { and, desc, eq, inArray } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { accounts, transactions } from '~~/server/db/schema'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)

  await requireAsset(id, user.id)

  const rows = await db
    .select({
      tx: transactions,
      account: accounts,
    })
    .from(transactions)
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
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
    .orderBy(desc(transactions.date))

  return {
    success: true,
    message: 'Asset purchases fetched successfully',
    data: rows.map(({ tx, account }) => ({
      id: tx.id,
      name: tx.name,
      type: tx.type,
      amount: tx.amount,
      quantity: tx.quantity,
      date: new Date(tx.date),
      description: tx.description,
      account: { id: account.id, name: account.name },
    })) satisfies AssetPurchase[],
  } satisfies APIResponse<AssetPurchase[]>
})
