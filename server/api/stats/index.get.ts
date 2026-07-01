import { eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { accounts, banks, categories, transactions } from '~~/server/db/schema'

type DebtInfo = {
  id: string
  counterparty: string
  originalAmount: number
  remainingAmount: number
}

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)

  const [userBanks, userAccounts, userTransactions, userCategories] =
    await Promise.all([
      db.select().from(banks).where(eq(banks.userId, user.id)),
      db.select().from(accounts).where(eq(accounts.userId, user.id)),
      db.select().from(transactions).where(eq(transactions.userId, user.id)),
      db.select().from(categories).where(eq(categories.userId, user.id)),
    ])

  const categoriesMap: Record<string, string> = {}
  for (const cat of userCategories) {
    categoriesMap[cat.id] = cat.name
  }

  const banksMap: Record<string, Bank> = {}

  for (const bank of userBanks) {
    banksMap[bank.id] = { id: bank.id, name: bank.name }
  }

  const accountStatsMap: Record<string, AccountStats> = {}

  for (const acc of userAccounts) {
    accountStatsMap[acc.id] = {
      id: acc.id,
      name: acc.name,
      type: acc.type,
      bank: acc.bankId ? (banksMap[acc.bankId]?.name ?? null) : null,
      isActive: acc.isActive,

      balance: 0,
      incomeSum: 0,
      expenseSum: 0,
    }
  }

  const expenseByCategoryMap = new Map<string, number>()
  const incomeByCategoryMap = new Map<string, number>()

  const activeLoansMap: Record<string, DebtInfo> = {}

  for (const tx of userTransactions) {
    if (tx.type === TRANSACTION_TYPES.LOAN_GIVEN) {
      const amount = parseFloat(tx.amount) || 0
      activeLoansMap[tx.id] = {
        id: tx.id,
        counterparty: tx.counterparty!,
        originalAmount: amount,
        remainingAmount: amount,
      }
    }
  }

  for (const tx of userTransactions) {
    const amount = parseFloat(tx.amount) || 0
    const stats = accountStatsMap[tx.accountId]

    if (!stats) throw new Error(`Account stats not found: ${tx.accountId}`)

    if (tx.type === TRANSACTION_TYPES.INCOME) {
      stats.balance += amount
      if (tx.categoryId) stats.incomeSum += amount
      const catKey = tx.categoryId ?? NONE_KEY
      incomeByCategoryMap.set(
        catKey,
        (incomeByCategoryMap.get(catKey) ?? 0) + amount
      )
    } else if (tx.type === TRANSACTION_TYPES.EXPENSE) {
      stats.balance -= amount
      if (tx.categoryId) stats.expenseSum += amount
      const catKey = tx.categoryId ?? NONE_KEY
      expenseByCategoryMap.set(
        catKey,
        (expenseByCategoryMap.get(catKey) ?? 0) + amount
      )
    } else if (tx.type === TRANSACTION_TYPES.LOAN_GIVEN) {
      stats.balance -= amount
    } else if (tx.type === TRANSACTION_TYPES.LOAN_RETURNED) {
      stats.balance += amount

      if (tx.transactionId) {
        const originalLoan = activeLoansMap[tx.transactionId]
        if (!originalLoan)
          throw new Error(`Original loan not found: ${tx.transactionId}`)

        originalLoan.remainingAmount -= amount
      }
    } else if (tx.type === TRANSACTION_TYPES.TRANSFER) {
      if (tx.toAccountId) {
        stats.balance -= amount
      } else {
        stats.balance += amount
      }
    }
  }

  const groupedDebtors = new Map<
    string,
    { amountToPay: number; loansCount: number }
  >()

  for (const loan of Object.values(activeLoansMap)) {
    if (loan.remainingAmount <= 0) continue

    const existing = groupedDebtors.get(loan.counterparty)

    if (existing) {
      existing.amountToPay += loan.remainingAmount
      existing.loansCount++
    } else {
      groupedDebtors.set(loan.counterparty, {
        amountToPay: loan.remainingAmount,
        loansCount: 1,
      })
    }
  }

  const debtors: Debtor[] = [...groupedDebtors.entries()].map(
    ([counterparty, data]) => ({
      counterparty,
      amountToPay: data.amountToPay,
      loansCount: data.loansCount,
    })
  )

  const totalAmountOwedToMe = debtors.reduce((sum, d) => sum + d.amountToPay, 0)

  const accountStatsList = Object.values(accountStatsMap)
  const totalBalance = accountStatsList.reduce(
    (sum, acc) => sum + acc.balance,
    0
  )
  const totalIncome = accountStatsList.reduce(
    (sum, acc) => sum + acc.incomeSum,
    0
  )
  const totalExpense = accountStatsList.reduce(
    (sum, acc) => sum + acc.expenseSum,
    0
  )

  const topExpenseCategories: CategoryStat[] = categoryStats(
    expenseByCategoryMap,
    categoriesMap,
    totalExpense
  )

  const topIncomeCategories: CategoryStat[] = categoryStats(
    incomeByCategoryMap,
    categoriesMap,
    totalIncome
  )

  return {
    success: true,
    message: 'Dashboard data fetched successfully',
    data: {
      totals: {
        balance: totalBalance,
        income: totalIncome,
        expense: totalExpense,
        owed: totalAmountOwedToMe,
      },
      accounts: accountStatsList,
      debtors,
      banks: Object.values(banksMap),
      topExpenseCategories,
      topIncomeCategories,
    },
  } satisfies StatsResponse
})
