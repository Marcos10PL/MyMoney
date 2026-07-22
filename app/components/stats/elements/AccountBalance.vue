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
      <UiAmount :value="incomeSum" />
    </UBadge>
    <UBadge v-if="expenseSum > 0" color="error" variant="soft">
      <UiAmount :value="expenseSum" />
    </UBadge>
    <UBadge color="neutral" variant="soft">
      <UiAmount :value="balance" :options="{ includeZero: true }" />
    </UBadge>
  </div>
</template>
