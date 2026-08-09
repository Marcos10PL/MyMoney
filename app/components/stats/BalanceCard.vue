<script lang="ts" setup>
defineProps<{
  balance: number
  owed: number
  incomePercent: number
  expensePercent: number
  loanPercent: number
  netPositive: boolean
  loading?: boolean
  totalInvestmentValue?: number
  netWorth?: number
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
          Majątek netto
        </p>
        <USkeleton v-if="loading" class="h-9 w-44 rounded-md" />
        <p
          v-else
          class="text-xl md:text-3xl font-semibold overflow-x-auto font-mono"
        >
          <UiAmount :value="netWorth ?? balance" />
        </p>
        <div
          v-if="owed > 0"
          class="flex items-center justify-between border-t border-default pt-1 text-xs mt-1.5 text-shadow-xs text-shadow-warning overflow-x-auto max-w-fit gap-2"
        >
          <span class="font-bold font-mono">
            <UiAmount :value="(netWorth ?? balance) + owed" />
          </span>
          <UiInfoPopover
            description="Majątek netto po odzyskaniu pożyczek"
            size="xs"
            variant="soft"
          />
        </div>

        <div class="mt-3 space-y-1">
          <div class="flex items-center gap-2 text-xs">
            <span class="uppercase font-semibold tracking-wide text-muted">Konta</span>
            <USkeleton v-if="loading" class="h-3 w-24 rounded" />
            <span v-else class="font-mono font-semibold text-foreground">
              <UiAmount :value="balance" />
            </span>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="uppercase font-semibold tracking-wide text-muted">Inwestycje</span>
            <USkeleton v-if="loading" class="h-3 w-24 rounded" />
            <span v-else class="font-mono font-semibold text-foreground">
              <UiAmount :value="totalInvestmentValue ?? 0" />
            </span>
          </div>
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
