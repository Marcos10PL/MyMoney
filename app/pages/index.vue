<script lang="ts" setup>
const { data, pending } = useLazyFetch('/api/stats', {
  transform: (res) => res.data,
})

const initialTotals = { balance: 0, income: 0, expense: 0, owed: 0 }

const percent = (value: number, total: number) => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

const accounts = computed(() => data.value?.accounts ?? [])
const activeAccounts = computed(() => accounts.value.filter((a) => a.isActive))
// const allAccounts = computed(() =>

const debtors = computed(() => data.value?.debtors ?? [])
const totals = computed(() => data.value?.totals ?? initialTotals)

const flowTotal = computed(
  () => totals.value.income + totals.value.expense + totals.value.owed
)
const incomePercent = computed(() =>
  percent(totals.value.income, flowTotal.value)
)
const expensePercent = computed(() =>
  percent(totals.value.expense, flowTotal.value)
)
const loanPercent = computed(() => percent(totals.value.owed, flowTotal.value))

const savings = computed(() => totals.value.income - totals.value.expense)

const savingsPercent = computed(() => {
  if (totals.value.income === 0) return 0
  return Math.max(percent(savings.value, totals.value.income))
})

const netPositive = computed(() => totals.value.income >= totals.value.expense)

const accountsWithPercents = computed(() =>
  accounts.value.map((acc) => {
    const total = acc.incomeSum + acc.expenseSum
    return {
      ...acc,
      incomePercent: percent(acc.incomeSum, total),
      expensePercent: percent(acc.expenseSum, total),
    }
  })
)
</script>

<template>
  <div class="space-y-5 max-w-7xl mx-auto">
    <!-- Page header -->
    <StatsDashboardHeader
      :active-accounts-count="activeAccounts.length"
      :debtors-count="debtors.length"
      :banks-count="data?.banks.length ?? 0"
    />

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Total Balance -->
      <StatsBalanceCard
        :balance="totals.balance"
        :owed="totals.owed"
        :income-percent="incomePercent"
        :expense-percent="expensePercent"
        :loan-percent="loanPercent"
        :net-positive="netPositive"
        :loading="pending"
      />

      <div class="flex flex-col gap-4">
        <!-- Income -->
        <StatsKpiCard
          label="Przychody"
          :amount="totals.income"
          :percent="incomePercent"
          color="success"
          icon="i-heroicons-arrow-down-left"
          :loading="pending"
        />

        <!-- Expenses -->
        <StatsKpiCard
          label="Wydatki"
          :amount="totals.expense"
          :percent="expensePercent"
          color="error"
          icon="i-heroicons-arrow-up-right"
          :loading="pending"
        />
      </div>
    </div>

    <!-- Savings Rate -->
    <StatsRate v-model="savingsPercent" label="Stopa oszczędności" />

    <!-- Accounts -->
    <StatsAccountsList
      :accounts="accountsWithPercents"
      :banks="data?.banks ?? []"
      :active-count="activeAccounts.length"
      :loading="pending"
    />

    <!-- Top expense categories -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StatsTopCategories
        :label="'Top 5 kategorii wydatków'"
        :categories="data?.topExpenseCategories ?? []"
        :loading="pending"
        type="expense"
      />

      <StatsTopCategories
        :label="'Top 5 kategorii przychodów'"
        :categories="data?.topIncomeCategories ?? []"
        :loading="pending"
        type="income"
      />
    </div>

    <!-- Debtors -->
    <StatsDebtorsList :debtors="debtors" :total-owed="totals.owed" />
  </div>
</template>
