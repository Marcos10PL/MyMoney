<script lang="ts" setup>
type AccountWithPercents = AccountStats & {
  incomePercent: number
  expensePercent: number
}
type SortKey = 'default' | 'balance' | 'incomeSum' | 'expenseSum'
type SortOption = { label: string; value: SortKey; icon: string }

const { accounts, banks } = defineProps<{
  accounts: AccountWithPercents[]
  banks: Bank[]
  activeCount: number
  loading?: boolean
}>()

const sortKey = ref<SortKey>('default')

const SORT_OPTIONS: SortOption[] = [
  { label: 'Domyślne', value: 'default', icon: 'i-heroicons-bars-3' },
  { label: 'Saldo', value: 'balance', icon: 'i-heroicons-scale' },
  {
    label: 'Przychody',
    value: 'incomeSum',
    icon: 'i-heroicons-arrow-down-left',
  },
  { label: 'Wydatki', value: 'expenseSum', icon: 'i-heroicons-arrow-up-right' },
]

const sorted = computed(() => {
  const arr = [...accounts]

  if (sortKey.value === 'default')
    return arr.sort((a, b) => Number(b.isActive) - Number(a.isActive))

  return arr.sort((a, b) => {
    const diff = b[sortKey.value as never] - a[sortKey.value as never]
    return diff !== 0 ? diff : Number(b.isActive) - Number(a.isActive)
  })
})

const hasUnassigned = computed(() => accounts.some((a) => !a.bank))

const tabs = computed(() => [
  { label: 'Wszystkie', value: 'all' },
  ...banks.map((b) => ({ label: b.name, value: b.name })),
  ...(hasUnassigned.value ? [{ label: 'Pozostałe', value: 'other' }] : []),
])

const activeTab = ref('all')

const filtered = computed(() => {
  if (activeTab.value === 'all') return sorted.value
  if (activeTab.value === 'other') return sorted.value.filter((a) => !a.bank)
  return sorted.value.filter((a) => a.bank === activeTab.value)
})
</script>

<template>
  <UCard class="lg:col-span-2">
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <div class="font-semibold">Konta ({{ accounts.length }})</div>
        <div class="flex items-center gap-2">
          <UBadge color="success" variant="soft" size="md">
            Aktywne: {{ activeCount }}
          </UBadge>
          <UiSelect
            v-model="sortKey"
            :items="SORT_OPTIONS"
            size="xs"
            variant="subtle"
            class="w-30"
          />
        </div>
      </div>
    </template>

    <!-- Bank tabs -->
    <UTabs
      v-if="!loading && tabs.length > 1 && banks.length > 0"
      v-model="activeTab"
      :items="tabs"
      size="sm"
      variant="link"
      class="mb-3"
    />

    <!-- Skeleton -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="flex items-center gap-3">
        <USkeleton class="size-14 rounded-xl shrink-0" />
        <div class="flex-1 space-y-2">
          <USkeleton class="h-4 w-32 rounded" />
          <USkeleton class="h-3 w-20 rounded" />
        </div>
        <USkeleton class="h-6 w-24 rounded shrink-0" />
      </div>
    </div>

    <div v-else-if="filtered.length > 0" class="divide-y divide-default">
      <div
        v-for="acc in filtered"
        :key="acc.id"
        class="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
        :class="{ 'opacity-40': !acc.isActive }"
      >
        <!-- Type icon -->
        <div
          class="size-14 rounded-xl bg-elevated flex items-center justify-center shrink-0"
        >
          <UIcon
            :name="ACCOUNT_TYPE_ICONS[acc.type as never]"
            class="size-7 text-muted"
          />
        </div>

        <!-- Name + meta + bar -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm font-medium truncate flex items-center gap-1">
              {{ acc.name }}
              <UBadge
                v-if="!acc.isActive"
                color="neutral"
                variant="soft"
                size="sm"
              >
                Nieaktywne
              </UBadge>
            </div>

            <!-- Balance + sums -->
            <UiInfoPopover class="flex md:hidden">
              <StatsElementsAccountBalance
                :balance="acc.balance"
                :income-sum="acc.incomeSum"
                :expense-sum="acc.expenseSum"
              />
            </UiInfoPopover>

            <StatsElementsAccountBalance
              class="hidden md:flex"
              :balance="acc.balance"
              :income-sum="acc.incomeSum"
              :expense-sum="acc.expenseSum"
            />
          </div>

          <p class="text-xs text-muted">
            {{ acc.bank ? acc.bank + ' · ' : '' }}
            {{ ACCOUNT_TYPES_LABELS[acc.type as never] }}
          </p>

          <StatsProgressBar
            v-if="acc.incomeSum > 0 || acc.expenseSum > 0"
            size="sm"
            class="mt-2.5"
            :income-percent="acc.incomePercent"
            :expense-percent="acc.expensePercent"
            :loan-percent="0"
            :show-legend="false"
          />
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex items-center justify-center py-6 text-xs text-muted"
    >
      Brak kont do wyświetlenia
    </div>
  </UCard>
</template>
