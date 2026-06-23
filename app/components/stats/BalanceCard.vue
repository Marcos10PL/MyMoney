<script lang="ts" setup>
defineProps<{
  balance: number
  owed: number
  incomePercent: number
  expensePercent: number
  loanPercent: number
  netPositive: boolean
  loading?: boolean
}>()
</script>

<template>
  <UCard
    variant="subtle"
    class="h-full"
    :ui="{
      root: 'flex flex-col h-full',
      body: 'flex-1',
    }"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="uppercase font-semibold text-xs text-muted mb-2">
          Łączne saldo
        </p>
        <USkeleton v-if="loading" class="h-9 w-44 rounded-md" />
        <p
          v-else
          class="text-xl md:text-3xl font-semibold overflow-x-auto font-mono"
        >
          {{ formatCurrency(balance) }}
        </p>
        <div
          v-if="owed > 0"
          class="flex items-center justify-between border-t border-default pt-1 text-xs mt-1.5 text-shadow-xs text-shadow-warning overflow-x-auto max-w-fit gap-2"
        >
          <span class="font-bold font-mono">
            {{ formatCurrency(balance + owed) }}
          </span>
          <UiInfoPopover
            description="Saldo po odzyskaniu pożyczek"
            size="xs"
            variant="soft"
          />
        </div>
      </div>
      <div
        class="shrink-0 size-12 rounded-xl flex items-center justify-center"
        :class="netPositive ? 'bg-success/10' : 'bg-error/10'"
      >
        <UIcon
          :name="
            netPositive
              ? 'i-heroicons-arrow-trending-up'
              : 'i-heroicons-arrow-trending-down'
          "
          class="size-6"
          :class="netPositive ? 'text-success' : 'text-error'"
        />
      </div>
    </div>

    <template #footer>
      <div class="mt-auto">
        <StatsProgressBar
          :income-percent="incomePercent"
          :expense-percent="expensePercent"
          :loan-percent="loanPercent"
        />
      </div>
    </template>
  </UCard>
</template>
