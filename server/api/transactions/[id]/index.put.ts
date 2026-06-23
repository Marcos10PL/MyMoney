import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { transactions } from '~~/server/db/schema'
import { updateTransactionBodySchema } from '~~/server/schema/body'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
  const body = await readValidatedBody(event, updateTransactionBodySchema.parse)

  const transaction = await db.transaction(async (tx) => {
    if (body.type === TRANSACTION_TYPES.LOAN_RETURNED) {
      const originalTransaction = await tx
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.id, body.transactionId!),
            eq(transactions.userId, user.id),
            eq(transactions.type, TRANSACTION_TYPES.LOAN_GIVEN)
          )
        )
        .limit(1)

      if (!originalTransaction) {
        throw createError({
          statusCode: 400,
          message: 'Original transaction not found for loan return',
        })
      }
    }

    const [result] = await db
      .update(transactions)
      .set({
        name: body.name,
        accountId: body.accountId,
        categoryId: body.categoryId ?? null,
        toAccountId: null,
        counterparty: body.counterparty,
        type: body.type,
        amount: String(body.amount),
        description: body.description ?? null,
        date: new Date(body.date),
        transactionId:
          body.type === TRANSACTION_TYPES.LOAN_RETURNED
            ? body.transactionId
            : null,
      })
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
      .returning()

    return result
  })

  if (!transaction)
    throw createError({ statusCode: 404, message: 'Transaction not found' })

  return {
    success: true,
    message: 'Transaction updated successfully',
  } satisfies APIResponse
})
