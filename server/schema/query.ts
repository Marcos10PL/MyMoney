import { z } from 'zod'
import { idFieldSchema } from './fields'

export const idParamSchema = z.object({
  id: idFieldSchema,
})

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

const searchQuerySchema = z.object({
  search: z.string().trim().optional(),
})

const sortQuerySchema = <T extends string>(keys: [T, ...T[]]) =>
  z.object({
    sortBy: z.enum(keys).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  })

export const transactionQueryFiltersSchema = z.object({
  type: z.enum(TRANSACTION_TYPES).optional(),

  categoryIds: z.preprocess(
    (val) => (typeof val === 'string' ? [val] : val),
    z.array(idFieldSchema).optional()
  ),

  accountIds: z.preprocess(
    (val) => (typeof val === 'string' ? [val] : val),
    z.array(idFieldSchema).optional()
  ),

  dateFrom: z.iso.date().optional(),
  dateTo: z.iso.date().optional(),
})

const sortableTransactionColumns = [
  'name',
  'amount',
  'date',
  'createdAt',
  'updatedAt',
] as const satisfies (keyof AppTransaction)[]

export const transactionsQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  ...searchQuerySchema.shape,
  ...sortQuerySchema<keyof AppTransaction>(sortableTransactionColumns).shape,
  ...transactionQueryFiltersSchema.shape,
})

// --- TYPES ---
export type TransactionFilters = z.infer<typeof transactionQueryFiltersSchema>
export type TransactionsSortableColumns =
  (typeof sortableTransactionColumns)[number]
