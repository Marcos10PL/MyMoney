<script lang="ts" setup>
defineProps<{
  activeAccountsCount: number
  debtorsCount: number
  banksCount: number
}>()
</script>

<template>
  <div
    class="flex items-center gap-2 *:flex *:items-center *:gap-2 *:uppercase *:text-[0.8rem] flex-wrap"
  >
    <UBadge color="neutral" variant="subtle" size="lg">
      Aktywne konta:
      <span class="font-bold">{{ activeAccountsCount }}</span>
      <UIcon name="i-heroicons-credit-card" class="size-4 self-start" />
    </UBadge>
    <UBadge v-if="debtorsCount > 0" color="warning" variant="soft" size="lg">
      Dłużnicy:
      <span class="font-bold">{{ debtorsCount }}</span>
      <UIcon name="i-heroicons-user-group" class="size-4 self-start" />
    </UBadge>
    <UBadge color="neutral" variant="soft" size="lg">
      Banki: <span class="font-bold">{{ banksCount }}</span>
      <UIcon name="i-heroicons-building-library" class="size-4 self-start" />
    </UBadge>
  </div>
</template>
