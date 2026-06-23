<script lang="ts" setup>
const { type } = defineProps<{
  categories: CategoryStat[]
  loading?: boolean
  label: string
  type: 'income' | 'expense'
}>()

const isIncome = computed(() => type === 'income')
</script>

<template>
  <UCard
    v-if="loading || categories.length > 0"
    :class="isIncome ? 'bg-success/5' : 'bg-error/5'"
  >
    <template #header>
      <div class="flex items-center gap-2 justify-between">
        <p class="font-semibold">{{ label }}</p>
        <UIcon
          :name="
            isIncome
              ? 'i-heroicons-arrow-down-left'
              : 'i-heroicons-arrow-up-right'
          "
          :class="isIncome ? 'text-success' : 'text-error'"
        />
      </div>
    </template>

    <!-- Skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="space-y-1.5">
        <div class="flex items-center justify-between">
          <USkeleton class="h-3.5 w-28 rounded" />
          <USkeleton class="h-3.5 w-16 rounded" />
        </div>
        <USkeleton class="h-1.5 w-full rounded-full" />
      </div>
    </div>

    <div v-else class="space-y-5">
      <div v-for="cat in categories" :key="cat.categoryId ?? '__none__'">
        <div class="flex items-center justify-between mb-1 gap-2">
          <span class="text-sm font-medium truncate">{{ cat.name }}</span>
          <span class="text-sm font-semibold font-mono shrink-0">
            {{ formatCurrency(cat.total) }}
          </span>
        </div>
        <UProgress
          v-model="cat.percent"
          size="xs"
          :color="isIncome ? 'success' : 'error'"
        />
      </div>
    </div>
  </UCard>
</template>
