<script setup lang="ts">
const { portfolio } = defineProps<{ portfolio: Portfolio | null }>()
const open = defineModel<boolean>('open', { default: false })

const { data, status, execute } = useFetch<APIResponse<AssetPerformanceData>>(
  () => `/api/investments/portfolios/${portfolio?.id ?? ''}/performance`,
  { immediate: false, watch: false }
)

watch(open, (v) => {
  if (v) {
    data.value = undefined
    execute()
  }
})

const snapshots = computed(() => data.value?.data?.snapshots ?? [])
const txs = computed(() => data.value?.data?.transactions ?? [])
</script>

<template>
  <UModal v-model:open="open" :title="portfolio?.name ?? ''" size="xl">
    <template v-if="portfolio" #description>
      <span class="font-mono font-semibold text-foreground">
        <UiAmount
          :value="portfolio.totalValue"
          :options="{ includeZero: true }"
        />
      </span>
      <span
        v-if="portfolio.totalGain !== 0"
        class="text-xs font-mono ml-2"
        :class="portfolio.totalGain > 0 ? 'text-success' : 'text-error'"
      >
        {{ portfolio.totalGain > 0 ? '+' : ''
        }}{{ formatCurrency(portfolio.totalGain) }}
      </span>
    </template>
    <template #body>
      <InvestmentsAssetChart
        :snapshots="snapshots"
        :transactions="txs"
        :loading="status === 'pending'"
      />
    </template>
  </UModal>
</template>
