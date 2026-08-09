<script setup lang="ts">
const {
  data,
  refresh: refreshPortfolios,
  pending,
} = useLazyFetch<APIResponse<Portfolio[]>>('/api/investments/portfolios')

const assetsStore = useAssetsStore()
onMounted(() => assetsStore.fetchAssets())

const assets = computed(() => assetsStore.assets)
const portfolios = computed(() => data.value?.data ?? [])
const loading = computed(() => pending.value || assetsStore.loading)

const refresh = () => {
  refreshPortfolios()
  assetsStore.fetchAssets({ force: true })
}

const portfoliosViewRef = useTemplateRef<{
  openCreatePortfolio: () => void
  firstTable: unknown
  columnVisibility: Record<string, boolean>
}>('portfoliosViewRef')

const columnVisibility = computed({
  get: () => portfoliosViewRef.value?.columnVisibility ?? {},
  set: (val) => {
    if (portfoliosViewRef.value) portfoliosViewRef.value.columnVisibility = val
  },
})

provide(investmentsLayoutKey, {
  table: computed(() => portfoliosViewRef.value?.firstTable),
  columnVisibility,
  openCreate: () => portfoliosViewRef.value?.openCreatePortfolio(),
  createLabel: 'Dodaj portfel',
  loading,
  onRefresh: refresh,
})
</script>

<template>
  <WrappersInvestments>
    <InvestmentsPortfoliosView
      ref="portfoliosViewRef"
      :portfolios="portfolios"
      :assets="assets"
      :loading="loading"
      :on-refresh="refreshPortfolios"
    />
  </WrappersInvestments>
</template>
