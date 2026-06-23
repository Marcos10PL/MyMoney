export type AccountStats = {
  id: string
  name: string
  type: string
  bank: string | null
  balance: number
  incomeSum: number
  expenseSum: number
  isActive: boolean
}

export type Debtor = {
  counterparty: string
  amountToPay: number
  loansCount: number
}

export type CategoryStat = {
  categoryId: string | null
  name: string
  total: number
  percent: number
}

export type StatsResponse = APIResponse<{
  totals: {
    balance: number
    income: number
    expense: number
    owed: number
  }
  accounts: AccountStats[]
  debtors: Debtor[]
  banks: Bank[]
  topExpenseCategories: CategoryStat[]
  topIncomeCategories: CategoryStat[]
}>
// ---- COMMON RESPONSE TYPE ----

export type APIResponse<T = unknown> = {
  message: string
} & (
  | {
      success: true
      data?: T
      pagination?: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }
  | { success: false; data?: never; pagination?: never }
)
