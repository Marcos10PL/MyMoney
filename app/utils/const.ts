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

export const ASSET_TYPES_LABELS = {
  bonds: 'Obligacje',
  etf: 'ETF',
  stocks: 'Akcje',
  gold: 'Złoto',
  real_estate: 'Nieruchomości',
  crypto: 'Kryptowaluty',
  cash: 'Gotówka',
  other: 'Inne',
} as const satisfies Record<AppAssetType, string>

export const CHART_PALETTE = [
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#3b82f6',
  '#8b5cf6',
  '#f97316',
  '#14b8a6',
  '#ec4899',
  '#84cc16',
] as const

export const ASSET_TYPE_COLORS = {
  bonds: '#6366f1',
  etf: '#3b82f6',
  stocks: '#10b981',
  gold: '#f59e0b',
  real_estate: '#f97316',
  crypto: '#8b5cf6',
  cash: '#14b8a6',
  other: '#84cc16',
} as const satisfies Record<AppAssetType, string>

export const ASSET_TYPES_ICONS = {
  bonds: 'i-lucide-scroll-text',
  etf: 'i-lucide-trending-up',
  stocks: 'i-lucide-bar-chart-2',
  gold: 'i-lucide-gem',
  real_estate: 'i-lucide-building-2',
  crypto: 'i-lucide-bitcoin',
  cash: 'i-lucide-banknote',
  other: 'i-lucide-package',
} as const satisfies Record<AppAssetType, string>

export const LINKS = {
  DASHBOARD: '/',
  LOGIN: '/login',
  TRANSACTIONS: '/transactions',
  ACCOUNTS: '/accounts',
  CATEGORIES: '/categories',
  BANKS: '/banks',
  INVESTMENTS: '/investments',
} as const

export const ACCOUNT_TYPE_ICONS = {
  checking: 'i-heroicons-building-library',
  savings: 'i-heroicons-banknotes',
  deposit: 'i-heroicons-lock-closed',
  investment: 'i-heroicons-chart-bar-square',
  wallet: 'i-heroicons-wallet',
  home: 'i-heroicons-home',
  other: 'i-heroicons-ellipsis-horizontal-circle',
} as const satisfies Record<Account['type'], string>
