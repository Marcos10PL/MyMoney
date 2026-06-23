export const LINKS = {
  DASHBOARD: '/',
  LOGIN: '/login',
  TRANSACTIONS: '/transactions',
  ACCOUNTS: '/accounts',
  CATEGORIES: '/categories',
  BANKS: '/banks',
} as const

export const ACTIONS_ID_COLUMN = 'actions'

export const CATEGORY_TYPES_LABELS = {
  income: 'Przychód',
  expense: 'Wydatek',
} as const satisfies Record<AppCategoryType, string>

export const ACCOUNT_TYPES_LABELS = {
  checking: 'Konto rozliczeniowe',
  savings: 'Konto oszczędnościowe',
  deposit: 'Lokata',
  investment: 'Inwestycja',
  wallet: 'Portfel',
  home: 'Dom',
  other: 'Inne',
} as const satisfies Record<AppAccountType, string>

export const ACCOUNT_DURATION_LABELS = {
  indefinite: 'Nieokreślony',
  fixed: 'Określony',
} as const satisfies Record<AppAccountDuration, string>

export const TRANSACTION_TYPES_LABELS = {
  income: 'Przychód',
  expense: 'Wydatek',
  loan_given: 'Pożyczka udzielona',
  loan_returned: 'Pożyczka zwrócona',
  transfer: 'Przelew własny',
} as const satisfies Record<AppTransactionType, string>

export const TRANSACTION_TYPES_COLORS = {
  income: 'success',
  expense: 'error',
  loan_given: 'info',
  loan_returned: 'secondary',
  transfer: 'neutral',
} as const satisfies Record<AppTransactionType, string>

export const ACCOUNT_TYPE_ICONS = {
  checking: 'i-heroicons-building-library',
  savings: 'i-heroicons-banknotes',
  deposit: 'i-heroicons-lock-closed',
  investment: 'i-heroicons-chart-bar-square',
  wallet: 'i-heroicons-wallet',
  home: 'i-heroicons-home',
  other: 'i-heroicons-ellipsis-horizontal-circle',
} as const satisfies Record<Account['type'], string>
