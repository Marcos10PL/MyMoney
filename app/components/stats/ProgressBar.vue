<script lang="ts" setup>
const { showLegend = true, size = 'md' } = defineProps<{
  incomePercent: number
  expensePercent: number
  loanPercent: number
  showLegend?: boolean
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div class="space-y-2">
    <div
      class="flex w-full rounded-full overflow-hidden gap-px border border-muted *:duration-700 *:transition-all"
      :class="{
        'h-1': size === 'sm',
        'h-2': size === 'md',
        'h-3': size === 'lg',
      }"
    >
      <div class="bg-success" :style="{ width: incomePercent + '%' }" />
      <div class="bg-error" :style="{ width: expensePercent + '%' }" />
      <div
        v-if="loanPercent > 0"
        class="bg-warning"
        :style="{ width: loanPercent + '%' }"
      />
    </div>
    <div
      v-if="showLegend"
      class="flex flex-wrap text-[0.63rem] uppercase font-bold gap-3.5 gap-y-1 opacity-90"
    >
      <span class="flex items-center gap-1">
        <span class="size-2 rounded-full bg-success inline-block" />
        Przychody {{ incomePercent }}%
      </span>
      <span class="flex items-center gap-1">
        <span class="size-2 rounded-full bg-error inline-block" />
        Wydatki {{ expensePercent }}%
      </span>
      <span v-if="loanPercent > 0" class="flex items-center gap-1">
        <span class="size-2 rounded-full bg-warning inline-block" />
        Pożyczki {{ loanPercent }}%
      </span>
    </div>
  </div>
</template>
