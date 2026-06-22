export const VALIDATION = {
  LOGIN_MIN_LENGTH: 3,
  LOGIN_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 8,

  PERCENTAGE_MIN: 0,
  PERCENTAGE_MAX: 100,

  ACCOUNT_NAME_MIN_LENGTH: 3,
  ACCOUNT_NAME_MAX_LENGTH: 255,
  ACCOUNT_DESCRIPTION_MAX_LENGTH: 1000,
  ACCOUNT_DESCRIPTION_MIN_LENGTH: 3,
  ACCOUNT_CONDITIONS_MAX_LENGTH: 1000,
  ACCOUNT_CONDITIONS_MIN_LENGTH: 3,

  BANK_NAME_MIN_LENGTH: 3,
  BANK_NAME_MAX_LENGTH: 255,

  TRANSACTION_NAME_MIN_LENGTH: 3,
  TRANSACTION_NAME_MAX_LENGTH: 255,
  TRANSACTION_DESCRIPTION_MIN_LENGTH: 3,
  TRANSACTION_DESCRIPTION_MAX_LENGTH: 500,
  TRANSACTION_COUNTERPARTY_MIN_LENGTH: 3,
  TRANSACTION_COUNTERPARTY_MAX_LENGTH: 255,
  TRANSACTION_AMOUNT_MAX: 99999999999.99,

  CATEGORY_NAME_MIN_LENGTH: 3,
  CATEGORY_NAME_MAX_LENGTH: 100,
} as const

export const USER_ROLES = {
  ADMIN: 'admin',
} as const satisfies Record<string, AppUserRoles>

export const ACCOUNT_TYPES = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
  DEPOSIT: 'deposit',
  INVESTMENT: 'investment',
  WALLET: 'wallet',
  HOME: 'home',
  OTHER: 'other',
} as const satisfies Record<string, AppAccountType>

export const ACCOUNT_DURATION = {
  INDEFINITE: 'indefinite',
  FIXED: 'fixed',
} as const satisfies Record<string, AppAccountDuration>

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
  LOAN_GIVEN: 'loan_given',
  LOAN_RECEIVED: 'loan_received',
} as const satisfies Record<string, AppTransactionType>

export const CATEGORY_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const satisfies Record<string, AppCategoryType>
