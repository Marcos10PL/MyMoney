import { db } from '~~/server/db/conn'
import { transactions } from '~~/server/db/schema'
import { createTransactionBodySchema } from '~~/server/schema/body'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const body = await readValidatedBody(event, createTransactionBodySchema.parse)

  await db.insert(transactions).values({
    userId: user.id,
    accountId: body.accountId,
    categoryId: body.categoryId,
    toAccountId: body.toAccountId,
    counterparty: body.counterparty,
    type: body.type,
    amount: String(body.amount),
    description: body.description,
    date: new Date(body.date),
  })

  return {
    success: true,
    message: 'Transaction created successfully',
  } satisfies APIResponse
})
