import { and, eq, inArray } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { assets, transactions } from '~~/server/db/schema'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)

  await requireAsset(id, user.id)

  await db.transaction(async (tx) => {
    await tx
      .delete(transactions)
      .where(
        and(
          eq(transactions.assetId, id),
          eq(transactions.userId, user.id),
          inArray(transactions.type, [
            TRANSACTION_TYPES.INVESTMENT_BUY,
            TRANSACTION_TYPES.INVESTMENT_SELL,
          ])
        )
      )
    await tx.delete(assets).where(eq(assets.id, id))
  })

  return {
    success: true,
    message: 'Asset deleted successfully',
    data: null,
  } satisfies APIResponse<null>
})
