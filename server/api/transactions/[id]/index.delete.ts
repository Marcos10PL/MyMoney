import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { transactions } from '~~/server/db/schema'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)

  const [transaction] = await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
    .returning()

  if (!transaction)
    throw createError({ statusCode: 404, message: 'Transaction not found' })

  return {
    success: true,
    message: 'Transaction deleted successfully',
  } satisfies APIResponse
})
