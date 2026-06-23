import z from 'zod'
import {
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
    amount: z
      .number('Kwota jest wymagana')
      .positive()
      .multipleOf(0.01)
      .max(VALIDATION.TRANSACTION_AMOUNT_MAX),
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

// --- TYPES ---
export type BankBody = z.infer<typeof bankSchema>
export type CategoryBody = z.infer<typeof categorySchema>
export type AccountBody = z.infer<typeof accountSchema>
