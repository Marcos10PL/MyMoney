import { z } from 'zod'
import {
  loginFieldSchema,
  passwordFieldSchema,
  idFieldSchema,
  textFieldSchema,
} from './fields'

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

    percentage: z
      .number()
      .min(VALIDATION.PERCENTAGE_MIN)
      .max(VALIDATION.PERCENTAGE_MAX)
      .multipleOf(0.01)
      .optional(),

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

export const createTransactionBodySchema = z
  .object({
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
    amount: z
      .number()
      .positive()
      .multipleOf(0.01)
      .max(VALIDATION.TRANSACTION_AMOUNT_MAX),
    description: textFieldSchema(
      VALIDATION.TRANSACTION_DESCRIPTION_MIN_LENGTH,
      VALIDATION.TRANSACTION_DESCRIPTION_MAX_LENGTH
    )
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val)),
    date: z.iso.datetime(),
  })
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
  })
  .transform((data) => {
    if (
      data.type !== TRANSACTION_TYPES.EXPENSE &&
      data.type !== TRANSACTION_TYPES.INCOME
    ) {
      data.categoryId = null
    }

    if (data.type !== TRANSACTION_TYPES.TRANSFER) data.toAccountId = null

    return data
  })

export const updateTransactionBodySchema =
  createTransactionBodySchema.superRefine((data, ctx) => {
    if (data.type === TRANSACTION_TYPES.TRANSFER) {
      ctx.addIssue({
        code: 'custom',
        message: 'Updating transaction type to transfer is not allowed',
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
