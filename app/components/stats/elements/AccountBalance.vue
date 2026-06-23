<script setup lang="ts">
defineProps<{
  incomeSum: number
  expenseSum: number
  balance: number
}>()
</script>

<template>
  <div class="flex items-end gap-1 shrink-0 *:font-mono *:font-semibold p-1">
    <UBadge v-if="incomeSum > 0" color="success" variant="soft">
      {{ formatCurrency(incomeSum) }}
    </UBadge>
    <UBadge v-if="expenseSum > 0" color="error" variant="soft">
      {{ formatCurrency(expenseSum) }}
    </UBadge>
    <UBadge color="neutral" variant="soft">
      {{ formatCurrency(balance, { includeZero: true }) }}
    </UBadge>
  </div>
</template>
