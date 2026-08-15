import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
import {
  createTransactionBodySchema,
  transactionBodyShape,
  updateTransactionBodySchema,
} from '~~/server/schema/body'
import { idFieldSchema } from '~~/server/schema/fields'
import { searchQuerySchema, transactionQueryFiltersSchema } from '~~/server/schema/query'
import type { TransactionsQuery } from '~~/server/schema/query'

const jsonResult = (data: unknown): CallToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
})

const errorResult = (err: unknown): CallToolResult => ({
  isError: true,
  content: [
    { type: 'text', text: err instanceof Error ? err.message : String(err) },
  ],
})

const listTransactionsInputSchema = z.object({
  ...transactionQueryFiltersSchema.shape,
  ...searchQuerySchema.shape,
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

const updateTransactionInputShape = {
  id: idFieldSchema,
  ...transactionBodyShape,
}

export const registerMcpTools = (server: McpServer, userId: string) => {
  server.registerTool(
    'get_balance',
    {
      description:
        'Get account balances, net worth, debtors and top income/expense categories.',
    },
    async () => {
      try {
        return jsonResult(await getDashboardStats(userId))
      } catch (err) {
        return errorResult(err)
      }
    }
  )

  server.registerTool(
    'list_accounts',
    {
      description:
        'List all accounts with their id, name, type and current balance. Use the id as accountId in add_transaction/update_transaction.',
    },
    async () => {
      try {
        return jsonResult(await listAccounts(userId))
      } catch (err) {
        return errorResult(err)
      }
    }
  )

  server.registerTool(
    'list_categories',
    {
      description:
        'List all categories with their id, name and type. Use the id as categoryId in add_transaction/update_transaction.',
    },
    async () => {
      try {
        return jsonResult(await listCategories(userId))
      } catch (err) {
        return errorResult(err)
      }
    }
  )

  server.registerTool(
    'list_transactions',
    {
      description:
        'List transactions with optional filters. Also returns income/expense sums for the filtered range - use dateFrom/dateTo for a monthly summary.',
      inputSchema: listTransactionsInputSchema,
    },
    async (input) => {
      try {
        const query: TransactionsQuery = { page: 1, sortOrder: 'asc', ...input }
        return jsonResult(await listTransactions(userId, query))
      } catch (err) {
        return errorResult(err)
      }
    }
  )

  server.registerTool(
    'add_transaction',
    {
      description:
        'Create a new transaction. Look up accountId/categoryId via list_accounts/list_categories first.',
      inputSchema: transactionBodyShape,
    },
    async (input) => {
      try {
        const body = createTransactionBodySchema.parse(input)
        await createTransaction(userId, body)
        return jsonResult({ message: 'Transaction created successfully' })
      } catch (err) {
        return errorResult(err)
      }
    }
  )

  server.registerTool(
    'update_transaction',
    {
      description:
        'Update an existing transaction by id (full overwrite, same fields as add_transaction). Find the id via list_transactions first.',
      inputSchema: updateTransactionInputShape,
    },
    async ({ id, ...input }) => {
      try {
        const body = updateTransactionBodySchema.parse(input)
        await updateTransaction(userId, id, body)
        return jsonResult({ message: 'Transaction updated successfully' })
      } catch (err) {
        return errorResult(err)
      }
    }
  )
}
