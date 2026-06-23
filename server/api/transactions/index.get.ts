import { alias } from 'drizzle-orm/pg-core'
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  inArray,
  lte,
} from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { accounts, categories, transactions } from '~~/server/db/schema'
import { transactionsQuerySchema } from '~~/server/schema/query'

const toAccounts = alias(accounts, 'to_accounts')
const tx = alias(transactions, 'tx')

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { page, limit, search, sortBy, sortOrder, ...filters } =
    await getValidatedQuery(event, transactionsQuerySchema.parse)

  const conditions = [eq(transactions.userId, user.id)]

  if (search) {
    conditions.push(ilike(transactions.name, `%${search}%`))
  }

  if (filters.accountIds && filters.accountIds.length > 0) {
    conditions.push(inArray(transactions.accountId, filters.accountIds))
  }

  if (filters.categoryIds && filters.categoryIds.length > 0) {
    conditions.push(inArray(transactions.categoryId, filters.categoryIds))
  }

  if (filters.dateFrom) {
    conditions.push(gte(transactions.date, new Date(filters.dateFrom)))
  }

  if (filters.dateTo) {
    conditions.push(lte(transactions.date, new Date(filters.dateTo)))
  }

  if (filters.type) {
    conditions.push(eq(transactions.type, filters.type))
  }

  let orderBy
  if (sortBy) {
    const columns = getTableColumns(transactions)

    if (sortBy in columns) {
      const column = columns[sortBy as keyof typeof columns]
      orderBy = sortOrder === 'desc' ? desc(column) : asc(column)
    }
  }

  const [countResult, items] = await Promise.all([
    db
      .select({ total: count() })
      .from(transactions)
      .where(and(...conditions)),
    db
      .select()
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .leftJoin(toAccounts, eq(transactions.toAccountId, toAccounts.id))
      .leftJoin(tx, eq(transactions.transactionId, tx.id))
      .where(and(...conditions))
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(orderBy || desc(transactions.date)),
  ])

  const total = countResult[0]?.total ?? 0

  return {
    success: true,
    message: 'Transactions fetched successfully',
    data: items.map(({ transactions, accounts, categories, to_accounts, tx }) =>
      mapTransactionToDTO(transactions, accounts, categories, to_accounts, tx)
    ),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  } satisfies APIResponse<Transaction[]>
})
