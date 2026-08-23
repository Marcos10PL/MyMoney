import z from 'zod'
import {
  decimalFieldSchema,
  idFieldSchema,
  loginFieldSchema,
  passwordFieldSchema,
  textFieldSchema,
} from './fields'

export const loginSchema = z.object({
  login: loginFieldSchema,
  password: passwordFieldSchema,
})

export const bankSchema = z.object({
  name: textFieldSchema(
    VALIDATION.BANK_NAME_MIN_LENGTH,
    VALIDATION.BANK_NAME_MAX_LENGTH
  ),
})

export const categorySchema = z.object({
  parentId: idFieldSchema.optional(),
  name: textFieldSchema(
    VALIDATION.CATEGORY_NAME_MIN_LENGTH,
    VALIDATION.CATEGORY_NAME_MAX_LENGTH
  ),
  type: z.enum(CATEGORY_TYPES),
})

export const accountSchema = z
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
      .or(z.literal('')),

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
      .or(z.literal('')),

    duration: z.enum(ACCOUNT_DURATION).default(ACCOUNT_DURATION.INDEFINITE!),
    durationEndDate: z.iso
      .datetime()
      .optional()
      .or(z.literal(''))
      .or(z.literal(null))
      .transform((val) => (val === '' || val === null ? undefined : val)),

    startDate: z.iso.datetime('Data jest wymagana'),
  })
  .superRefine((data, ctx) => {
    if (data.duration === ACCOUNT_DURATION.FIXED && !data.durationEndDate) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Data zakończenia jest wymagana, gdy czas trwania jest określony',
        path: ['durationEndDate'],
      })
    }
  })

export const transactionSchema = z
  .object({
    name: textFieldSchema(
      VALIDATION.TRANSACTION_NAME_MIN_LENGTH,
      VALIDATION.TRANSACTION_NAME_MAX_LENGTH
    ),
    accountId: idFieldSchema,
    categoryId: idFieldSchema.optional(),
    toAccountId: idFieldSchema.optional(),
    transactionId: idFieldSchema.optional(),
    counterparty: textFieldSchema(
      VALIDATION.TRANSACTION_COUNTERPARTY_MIN_LENGTH,
      VALIDATION.TRANSACTION_COUNTERPARTY_MAX_LENGTH
    )
      .optional()
      .or(z.literal('')),

    type: z.enum(TRANSACTION_TYPES),
    amount: decimalFieldSchema(0.01, VALIDATION.TRANSACTION_AMOUNT_MAX),
    description: textFieldSchema(
      VALIDATION.TRANSACTION_DESCRIPTION_MIN_LENGTH,
      VALIDATION.TRANSACTION_DESCRIPTION_MAX_LENGTH
    )
      .optional()
      .or(z.literal('')),
    date: z.iso.datetime('Data jest wymagana'),
  })
  .superRefine((data, ctx) => {
    if (data.type === TRANSACTION_TYPES.TRANSFER && !data.toAccountId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Konto docelowe jest wymagane dla przelewu wewnętrznego',
        path: ['toAccountId'],
      })
    }

    if (
      data.type === TRANSACTION_TYPES.TRANSFER &&
      data.accountId === data.toAccountId
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Konto docelowe musi być inne niż konto źródłowe',
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
        message: 'Kontrahent jest wymagany dla pożyczek',
        path: ['counterparty'],
      })
    }

    if (data.type === TRANSACTION_TYPES.LOAN_RETURNED && !data.transactionId) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Wskazanie transakcji "Pożyczka udzielona" jest wymagane dla zwrotu pożyczki',
        path: ['transactionId'],
      })
    }
  })

export const assetSchema = z.object({
  accountIds: z.array(idFieldSchema).default([]),
  name: textFieldSchema(VALIDATION.ASSET_NAME_MIN, VALIDATION.ASSET_NAME_MAX),
  type: z.enum(ASSET_TYPES),
  value: decimalFieldSchema(0, VALIDATION.TRANSACTION_AMOUNT_MAX),
  currency: z.string().trim().length(3).default('PLN'),
  description: textFieldSchema(1, VALIDATION.ASSET_DESCRIPTION_MAX)
    .optional()
    .or(z.literal('')),
})

export const portfolioSchema = z.object({
  name: textFieldSchema(
    VALIDATION.PORTFOLIO_NAME_MIN,
    VALIDATION.PORTFOLIO_NAME_MAX
  ),
  description: textFieldSchema(1, VALIDATION.PORTFOLIO_DESCRIPTION_MAX)
    .optional()
    .or(z.literal('')),
})

export const portfolioAssetSchema = z
  .object({
    assetId: idFieldSchema,
    allocatedAmount: decimalFieldSchema().optional().nullable(),
    allocationMode: z.enum(ALLOCATION_MODES).default(ALLOCATION_MODES.VALUE),
    targetPercent: decimalFieldSchema(0, 100).optional().nullable(),
    maxDeviation: decimalFieldSchema(0, 100).optional().nullable(),
    gainWeight: decimalFieldSchema(0, 100).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (
      data.allocationMode === ALLOCATION_MODES.COST &&
      data.allocatedAmount == null
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Kwota jest wymagana przy trybie kosztowym',
        path: ['allocatedAmount'],
      })
    }
  })

export const investmentBuySchema = z.object({
  assetId: idFieldSchema,
  accountId: idFieldSchema,
  amount: decimalFieldSchema(0.01, VALIDATION.TRANSACTION_AMOUNT_MAX),
  quantity: decimalFieldSchema(0.000001, 999999999).optional().nullable(),
  date: z.iso.datetime('Data jest wymagana'),
  name: textFieldSchema(
    VALIDATION.TRANSACTION_NAME_MIN_LENGTH,
    VALIDATION.TRANSACTION_NAME_MAX_LENGTH
  ).optional(),
  description: textFieldSchema(
    VALIDATION.TRANSACTION_DESCRIPTION_MIN_LENGTH,
    VALIDATION.TRANSACTION_DESCRIPTION_MAX_LENGTH
  )
    .optional()
    .or(z.literal('')),
  type: z
    .enum([
      TRANSACTION_TYPES.INVESTMENT_BUY!,
      TRANSACTION_TYPES.INVESTMENT_SELL!,
    ])
    .default(TRANSACTION_TYPES.INVESTMENT_BUY!),
})

export const assetSnapshotSchema = z.object({
  value: decimalFieldSchema(0.01, VALIDATION.TRANSACTION_AMOUNT_MAX),
  date: z.iso.date().optional(),
})

// --- TYPES ---
export type BankBody = z.infer<typeof bankSchema>
export type CategoryBody = z.infer<typeof categorySchema>
export type AccountBody = z.infer<typeof accountSchema>
export type AssetBody = z.infer<typeof assetSchema>
export type PortfolioBody = z.infer<typeof portfolioSchema>
export type PortfolioAssetBody = z.infer<typeof portfolioAssetSchema>
export type InvestmentBuyBody = z.infer<typeof investmentBuySchema>
