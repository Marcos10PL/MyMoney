import { alias } from 'drizzle-orm/pg-core'
import { count, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { accounts, categories, transactions } from '~~/server/db/schema'
import { paginationQuerySchema } from '~~/server/schema/query'

const toAccounts = alias(accounts, 'to_accounts')

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { page, limit } = await getValidatedQuery(
    event,
    paginationQuerySchema.parse
  )

  const where = eq(transactions.userId, user.id)

  const [countResult, items] = await Promise.all([
    db.select({ total: count() }).from(transactions).where(where),
    db
      .select({
        id: transactions.id,
        account: { id: accounts.id, name: accounts.name },
        category: { id: categories.id, name: categories.name },
        toAccount: { id: toAccounts.id, name: toAccounts.name },
        counterparty: transactions.counterparty,
        type: transactions.type,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .leftJoin(toAccounts, eq(transactions.toAccountId, toAccounts.id))
      .where(where)
      .limit(limit)
      .offset((page - 1) * limit),
  ])

  const total = countResult[0]?.total ?? 0

  return {
    success: true,
    message: 'Transactions fetched successfully',
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  } satisfies APIResponse<Transaction[]>
})
