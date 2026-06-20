import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { transactions } from '~~/server/db/schema'
import { updateTransactionBodySchema } from '~~/server/schema/body'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
  const body = await readValidatedBody(event, updateTransactionBodySchema.parse)

  const [transaction] = await db
    .update(transactions)
    .set({
      accountId: body.accountId,
      categoryId: body.categoryId,
      toAccountId: body.toAccountId,
      counterparty: body.counterparty,
      type: body.type,
      amount: String(body.amount),
      description: body.description,
      date: new Date(body.date),
    })
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
    .returning()

  if (!transaction)
    throw createError({ statusCode: 404, message: 'Transaction not found' })

  return {
    success: true,
    message: 'Transaction updated successfully',
  } satisfies APIResponse
})
