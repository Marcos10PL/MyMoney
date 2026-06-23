<script lang="ts" setup>
defineProps<{
  debtors: Debtor[]
  totalOwed: number
}>()

const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
</script>

<template>
  <UCard v-if="debtors.length > 0">
    <template #header>
      <div class="flex items-center justify-between">
        <p class="font-semibold">Dłużnicy</p>
        <UBadge color="warning" variant="soft" size="sm">
          {{ debtors.length }}
        </UBadge>
      </div>
    </template>

    <div class="divide-y divide-default">
      <div
        v-for="debtor in debtors"
        :key="debtor.counterparty"
        class="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
      >
        <div
          class="size-9 rounded-full bg-warning/15 flex items-center justify-center shrink-0 text-xs font-bold text-warning"
        >
          {{ initials(debtor.counterparty) }}
        </div>
        <p class="text-sm font-medium flex-1 min-w-0 truncate">
          {{ debtor.counterparty }}
        </p>
        <p class="text-sm font-mono font-semibold text-warning shrink-0">
          {{ formatCurrency(debtor.amountToPay) }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between">
        <span class="text-muted text-xs uppercase tracking-wider font-medium">
          Łącznie do odzyskania
        </span>
        <span class="font-mono font-bold text-warning text-sm">
          {{ formatCurrency(totalOwed) }}
        </span>
      </div>
    </template>
  </UCard>
</template>
