import { z } from 'zod'
import {
  loginFieldSchema,
  passwordFieldSchema,
  idFieldSchema,
  textFieldSchema,
  decimalFieldSchema,
} from './fields'
import { ASSET_TYPES } from '~~/shared/utils/const'

export const loginBodySchema = z.object({
  login: loginFieldSchema,
  password: passwordFieldSchema,
})

export const createAccountBodySchema = z
  .object({
    bankId: idFieldSchema.optional(),
    name: textFieldSchema(
      VALIDATION.ACCOUNT_NAME_MIN_LENGTH,
      VALIDATION.ACCOUNT_NAME_MAX_LENGTH
    ),
    description: textFieldSchema(
      VALIDATION.ACCOUNT_DESCRIPTION_MIN_LENGTH,
      VALIDATION.ACCOUNT_DESCRIPTION_MAX_LENGTH
    )
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val)),

    type: z.enum(ACCOUNT_TYPES).default(ACCOUNT_TYPES.CHECKING!),

    percentage: decimalFieldSchema(
      VALIDATION.PERCENTAGE_MIN,
      VALIDATION.PERCENTAGE_MAX
    ).optional(),

    isFree: z.boolean().default(false),
    isActive: z.boolean().default(true),

    conditions: textFieldSchema(
      VALIDATION.ACCOUNT_CONDITIONS_MIN_LENGTH,
      VALIDATION.ACCOUNT_CONDITIONS_MAX_LENGTH
    )
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val)),

    duration: z.enum(ACCOUNT_DURATION).default(ACCOUNT_DURATION.INDEFINITE!),
    durationEndDate: z.iso.datetime().optional().nullable(),

    startDate: z.iso.datetime(),
  })
  .superRefine((data, ctx) => {
    if (data.duration === ACCOUNT_DURATION.FIXED && !data.durationEndDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'End date is required when duration is fixed',
        path: ['durationEndDate'],
      })
    }
  })
  .transform((data) => {
    if (data.duration === ACCOUNT_DURATION.INDEFINITE) {
      data.durationEndDate = null
    }
    return data
  })

export const updateAccountBodySchema = createAccountBodySchema

export const createBankBodySchema = z.object({
  name: textFieldSchema(
    VALIDATION.BANK_NAME_MIN_LENGTH,
    VALIDATION.BANK_NAME_MAX_LENGTH
  ),
})

export const updateBankBodySchema = createBankBodySchema

export const transactionBodyShape = {
  name: textFieldSchema(
    VALIDATION.TRANSACTION_NAME_MIN_LENGTH,
    VALIDATION.TRANSACTION_NAME_MAX_LENGTH
  ),
  accountId: idFieldSchema,
  categoryId: idFieldSchema.optional().nullable(),
  toAccountId: idFieldSchema.optional().nullable(),
  transactionId: idFieldSchema.optional().nullable(),
  counterparty: textFieldSchema(
    VALIDATION.TRANSACTION_COUNTERPARTY_MIN_LENGTH,
    VALIDATION.TRANSACTION_COUNTERPARTY_MAX_LENGTH
  )
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),

  type: z.enum(TRANSACTION_TYPES),
  amount: decimalFieldSchema(0.01, VALIDATION.TRANSACTION_AMOUNT_MAX),
  description: textFieldSchema(
    VALIDATION.TRANSACTION_DESCRIPTION_MIN_LENGTH,
    VALIDATION.TRANSACTION_DESCRIPTION_MAX_LENGTH
  )
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),
  date: z.iso.datetime(),

  assetId: idFieldSchema.optional().nullable(),
  quantity: z.number().positive().optional().nullable(),
  marketValue: decimalFieldSchema(0.01, VALIDATION.TRANSACTION_AMOUNT_MAX)
    .optional()
    .nullable(),
}

export const createTransactionBodySchema = z
  .object(transactionBodyShape)
  .superRefine((data, ctx) => {
    if (data.type === TRANSACTION_TYPES.TRANSFER && !data.toAccountId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Target account is required for transfers',
        path: ['toAccountId'],
      })
    }
    if (
      data.type === TRANSACTION_TYPES.TRANSFER &&
      data.toAccountId &&
      data.toAccountId === data.accountId
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Source and target accounts must be different',
        path: ['toAccountId'],
      })
    }
    if (
      (data.type === TRANSACTION_TYPES.LOAN_GIVEN ||
        data.type === TRANSACTION_TYPES.LOAN_RETURNED) &&
      !data.counterparty
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Counterparty is required for loans',
        path: ['counterparty'],
      })
    }
    if (data.type === TRANSACTION_TYPES.LOAN_RETURNED && !data.transactionId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Transaction ID is required for loan returns',
        path: ['transactionId'],
      })
    }
    if (
      (data.type === TRANSACTION_TYPES.INVESTMENT_BUY ||
        data.type === TRANSACTION_TYPES.INVESTMENT_SELL) &&
      !data.assetId
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Asset is required for investment transactions',
        path: ['assetId'],
      })
    }
  })
  .transform((data) => {
    if (
      data.type !== TRANSACTION_TYPES.EXPENSE &&
      data.type !== TRANSACTION_TYPES.INCOME
    ) {
      data.categoryId = null
    }
    if (data.type !== TRANSACTION_TYPES.TRANSFER) data.toAccountId = null
    if (
      data.type !== TRANSACTION_TYPES.INVESTMENT_BUY &&
      data.type !== TRANSACTION_TYPES.INVESTMENT_SELL
    ) {
      data.assetId = null
      data.quantity = null
    }
    return data
  })

export const updateTransactionBodySchema =
  createTransactionBodySchema.superRefine((data, ctx) => {
    if (data.type === TRANSACTION_TYPES.TRANSFER) {
      ctx.addIssue({
        code: 'custom',
        message: 'Updating transaction type to this type is not allowed',
        path: ['type'],
      })
    }
  })

export const createCategoryBodySchema = z.object({
  parentId: idFieldSchema.optional(),
  name: textFieldSchema(
    VALIDATION.CATEGORY_NAME_MIN_LENGTH,
    VALIDATION.CATEGORY_NAME_MAX_LENGTH
  ),
  type: z.enum(CATEGORY_TYPES),
})

export const updateCategoryBodySchema = createCategoryBodySchema

export const createAssetBodySchema = z.object({
  accountIds: z.array(idFieldSchema).default([]),
  name: textFieldSchema(VALIDATION.ASSET_NAME_MIN, VALIDATION.ASSET_NAME_MAX),
  type: z.enum(ASSET_TYPES),
  value: decimalFieldSchema(0, VALIDATION.TRANSACTION_AMOUNT_MAX).default(0),
  currency: z.string().trim().length(3).default('PLN'),
  description: textFieldSchema(1, VALIDATION.ASSET_DESCRIPTION_MAX)
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),
})

export const updateAssetBodySchema = createAssetBodySchema

export const createPortfolioBodySchema = z.object({
  name: textFieldSchema(
    VALIDATION.PORTFOLIO_NAME_MIN,
    VALIDATION.PORTFOLIO_NAME_MAX
  ),
  description: textFieldSchema(1, VALIDATION.PORTFOLIO_DESCRIPTION_MAX)
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),
})

export const updatePortfolioBodySchema = createPortfolioBodySchema

export const addPortfolioAssetBodySchema = z.object({
  assetId: idFieldSchema,
  allocatedAmount: decimalFieldSchema().optional().nullable(),
  targetPercent: decimalFieldSchema(0, 100).optional().nullable(),
  maxDeviation: decimalFieldSchema(0, 100).optional().nullable(),
  gainWeight: decimalFieldSchema(0, 100).optional().nullable(),
})

export const updatePortfolioAssetBodySchema = addPortfolioAssetBodySchema.omit({
  assetId: true,
})

export const assetSnapshotBodySchema = z.object({
  value: decimalFieldSchema(0.01, VALIDATION.TRANSACTION_AMOUNT_MAX),
  date: z.iso.date().optional(),
})

// --- TYPES ---
export type CreateTransactionBody = z.infer<typeof createTransactionBodySchema>
export type UpdateTransactionBody = z.infer<typeof updateTransactionBodySchema>
