import { alias } from 'drizzle-orm/pg-core'
import { and, desc, eq, ilike, sql } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { transactions } from '~~/server/db/schema'
import { searchQuerySchema } from '~~/server/schema/query'

const returns = alias(transactions, 'returns')

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { search } = await getValidatedQuery(event, searchQuerySchema.parse)

  const conditions = [
    eq(transactions.userId, user.id),
    eq(transactions.type, TRANSACTION_TYPES.LOAN_GIVEN),
  ]

  if (search) conditions.push(ilike(transactions.name, `%${search}%`))

  const loans = await db
    .select({
      id: transactions.id,
      name: transactions.name,
      amount: transactions.amount,
      counterparty: transactions.counterparty,
      remainingAmount:
        sql<string>`(${transactions.amount} - COALESCE(SUM(${returns.amount}), 0))`.as(
          'remaining_amount'
        ),
    })
    .from(transactions)
    .leftJoin(
      returns,
      and(
        eq(returns.transactionId, transactions.id),
        eq(returns.type, TRANSACTION_TYPES.LOAN_RETURNED)
      )
    )
    .where(and(...conditions))
    .groupBy(
      transactions.id,
      transactions.name,
      transactions.amount,
      transactions.counterparty
    )
    .having(sql`COALESCE(SUM(${returns.amount}), 0) < ${transactions.amount}`)
    .orderBy(desc(transactions.date))
    .limit(20)

  return {
    success: true,
    message: 'Unpaid loans fetched successfully',
    data: loans,
  } satisfies APIResponse<typeof loans>
})
