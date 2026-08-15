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
  sql,
  sum,
} from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import {
  accounts,
  assetSnapshots,
  assets,
  categories,
  transactions,
} from '~~/server/db/schema'
import type { TransactionsQuery } from '~~/server/schema/query'
import type {
  CreateTransactionBody,
  UpdateTransactionBody,
} from '~~/server/schema/body'

const toAccounts = alias(accounts, 'to_accounts')
const tx = alias(transactions, 'tx')

export type ListTransactionsResult = {
  data: Transaction[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  sums: { incomeSum: number; expenseSum: number }
}

export const listTransactions = async (
  userId: string,
  query: TransactionsQuery
): Promise<ListTransactionsResult> => {
  const { page, limit, search, sortBy, sortOrder, ...filters } = query

  const conditions = [eq(transactions.userId, userId)]

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

  const [countResult, sumsResult, items] = await Promise.all([
    db
      .select({ total: count() })
      .from(transactions)
      .where(and(...conditions)),
    db
      .select({
        incomeSum: sum(
          sql`CASE WHEN ${transactions.type} = 'income' AND ${transactions.categoryId} IS NOT NULL THEN ${transactions.amount}::numeric ELSE 0 END`
        ),
        expenseSum: sum(
          sql`CASE WHEN ${transactions.type} = 'expense' AND ${transactions.categoryId} IS NOT NULL THEN ${transactions.amount}::numeric ELSE 0 END`
        ),
      })
      .from(transactions)
      .where(and(...conditions)),
    db
      .select()
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .leftJoin(toAccounts, eq(transactions.toAccountId, toAccounts.id))
      .leftJoin(tx, eq(transactions.transactionId, tx.id))
      .leftJoin(assets, eq(transactions.assetId, assets.id))
      .where(and(...conditions))
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(orderBy || desc(transactions.date)),
  ])

  const total = countResult[0]?.total ?? 0
  const incomeSum = parseFloat(sumsResult[0]?.incomeSum ?? '0') || 0
  const expenseSum = parseFloat(sumsResult[0]?.expenseSum ?? '0') || 0

  return {
    data: items.map(
      ({ transactions, accounts, categories, to_accounts, tx, assets }) =>
        mapTransactionToDTO(
          transactions,
          accounts,
          categories,
          to_accounts,
          tx,
          assets
        )
    ),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    sums: { incomeSum, expenseSum },
  }
}

export const createTransaction = async (
  userId: string,
  body: CreateTransactionBody
): Promise<void> => {
  await db.transaction(async (dbTx) => {
    if (body.type === TRANSACTION_TYPES.LOAN_RETURNED) {
      const originalTransaction = await dbTx
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.id, body.transactionId!),
            eq(transactions.userId, userId),
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

    await dbTx.insert(transactions).values({
      userId,
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
      await dbTx.insert(transactions).values({
        userId,
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
      await dbTx
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
      await dbTx
        .update(assets)
        .set({ value: String(body.marketValue) })
        .where(and(eq(assets.id, body.assetId), eq(assets.userId, userId)))
    }
  })
}

export const updateTransaction = async (
  userId: string,
  id: string,
  body: UpdateTransactionBody
): Promise<void> => {
  const transaction = await db.transaction(async (dbTx) => {
    if (body.type === TRANSACTION_TYPES.LOAN_RETURNED) {
      const originalTransaction = await dbTx
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.id, body.transactionId!),
            eq(transactions.userId, userId),
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

    const [result] = await dbTx
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
        assetId: body.assetId ?? null,
        quantity: body.quantity != null ? String(body.quantity) : null,
      })
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning()

    return result
  })

  if (!transaction)
    throw createError({ statusCode: 404, message: 'Transaction not found' })
}
