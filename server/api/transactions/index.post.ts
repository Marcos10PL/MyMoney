import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { assetSnapshots, assets, transactions } from '~~/server/db/schema'
import { createTransactionBodySchema } from '~~/server/schema/body'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const body = await readValidatedBody(event, createTransactionBodySchema.parse)

  await db.transaction(async (tx) => {
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
      transactionId:
        body.type === TRANSACTION_TYPES.LOAN_RETURNED
          ? body.transactionId
          : null,
      assetId: body.assetId ?? null,
      quantity: body.quantity != null ? String(body.quantity) : null,
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
        transactionId: null,
      })
    }

    if (body.marketValue && body.assetId) {
      const snapshotDate = new Date(body.date).toISOString().split('T')[0]!
      await tx
        .insert(assetSnapshots)
        .values({
          assetId: body.assetId,
          value: String(body.marketValue),
          date: snapshotDate,
        })
        .onConflictDoUpdate({
          target: [assetSnapshots.assetId, assetSnapshots.date],
          set: { value: String(body.marketValue) },
        })
      await tx
        .update(assets)
        .set({ value: String(body.marketValue) })
        .where(and(eq(assets.id, body.assetId), eq(assets.userId, user.id)))
    }
  })

  return {
    success: true,
    message: 'Transaction created successfully',
  } satisfies APIResponse
})
