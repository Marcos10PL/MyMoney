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
  investment_buy: 'Zakup aktywa',
  investment_sell: 'Sprzedaż aktywa',
} as const satisfies Record<AppTransactionType, string>

export const TRANSACTION_TYPES_COLORS = {
  income: 'success',
  expense: 'error',
  loan_given: 'info',
  loan_returned: 'secondary',
  transfer: 'neutral',
  investment_buy: 'warning',
  investment_sell: 'primary',
} as const satisfies Record<AppTransactionType, string>

export const ASSET_TYPE_META = {
  bonds: { label: 'Obligacje', color: '#6366f1', icon: 'i-lucide-scroll-text' },
  etf: { label: 'ETF', color: '#3b82f6', icon: 'i-lucide-trending-up' },
  stocks: { label: 'Akcje', color: '#10b981', icon: 'i-lucide-bar-chart-2' },
  gold: { label: 'Złoto', color: '#f59e0b', icon: 'i-lucide-gem' },
  real_estate: {
    label: 'Nieruchomości',
    color: '#f97316',
    icon: 'i-lucide-building-2',
  },
  crypto: { label: 'Kryptowaluty', color: '#8b5cf6', icon: 'i-lucide-bitcoin' },
  cash: { label: 'Gotówka', color: '#14b8a6', icon: 'i-lucide-banknote' },
  other: { label: 'Inne', color: '#84cc16', icon: 'i-lucide-package' },
} as const satisfies Record<
  AppAssetType,
  { label: string; color: string; icon: string }
>

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

export const LINKS = {
  DASHBOARD: '/',
  LOGIN: '/login',
  TRANSACTIONS: '/transactions',
  ACCOUNTS: '/accounts',
  CATEGORIES: '/categories',
  BANKS: '/banks',
  INVESTMENTS: '/investments',
  PORTFOLIOS: '/investments/portfolios',
  ASSETS: '/investments/assets',
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
