import { db } from '~~/server/db/conn'
import { transactions } from '~~/server/db/schema'
import { createTransactionBodySchema } from '~~/server/schema/body'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const body = await readValidatedBody(event, createTransactionBodySchema.parse)

  await db.transaction(async (tx) => {
    await tx.insert(transactions).values({
      userId: user.id,
      name: body.name,
      accountId: body.accountId,
      categoryId: body.categoryId ?? null,
      toAccountId: body.toAccountId ?? null,
      counterparty: body.counterparty ?? null,
      type: body.type,
      amount: String(body.amount),
      description: body.description ?? null,
      date: new Date(body.date),
    })

    if (body.toAccountId) {
      await tx.insert(transactions).values({
        userId: user.id,
        name: `Transfer: ${body.name}`,
        accountId: body.toAccountId,
        categoryId: null,
        toAccountId: null,
        counterparty: null,
        type: TRANSACTION_TYPES.TRANSFER,
        amount: String(body.amount),
        description: null,
        date: new Date(body.date),
      })
    }
  })

  return {
    success: true,
    message: 'Transaction created successfully',
  } satisfies APIResponse
})
