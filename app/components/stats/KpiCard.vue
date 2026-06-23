<script lang="ts" setup>
const { color } = defineProps<{
  label: string
  amount: number
  percent: number
  color: 'success' | 'error' | 'warning' | 'info'
  icon: string
  loading?: boolean
}>()

const classes = {
  success: {
    card: 'ring-1 ring-success/30 bg-success/10',
    text: 'text-success',
    icon: 'bg-success/10 text-success',
  },
  error: {
    card: 'ring-1 ring-error/30 bg-error/10',
    text: 'text-error',
    icon: 'bg-error/10 text-error',
  },
  warning: {
    card: 'ring-1 ring-warning/30 bg-warning/10',
    text: 'text-warning',
    icon: 'bg-warning/10 text-warning',
  },
  info: {
    card: 'ring-1 ring-info/30 bg-info/10',
    text: 'text-info',
    icon: 'bg-info/10 text-info',
  },
} as const

const c = computed(() => classes[color])
</script>

<template>
  <UCard :class="c.card">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p
          class="text-[11px] uppercase tracking-widest text-muted mb-2 font-bold"
        >
          {{ label }} ({{ percent }}%)
        </p>
        <USkeleton v-if="loading" class="h-8 w-28 rounded-md" />
        <p
          v-else
          :class="`text-lg md:text-2xl font-bold overflow-x-auto font-mono ${c.text}`"
        >
          {{ formatCurrency(amount) }}
        </p>
      </div>
      <div
        :class="`shrink-0 size-10 rounded-xl flex items-center justify-center ${c.icon}`"
      >
        <UIcon :name="icon" class="size-5" />
      </div>
    </div>
  </UCard>
</template>
