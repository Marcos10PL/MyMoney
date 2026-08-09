<script setup lang="ts">
const assetsStore = useAssetsStore()
onMounted(() => assetsStore.fetchAssets())

const assets = computed(() => assetsStore.assets)
const refresh = () => assetsStore.fetchAssets({ force: true })

const assetsViewRef = useTemplateRef<{
  openCreateAsset: () => void
  table: unknown
  columnVisibility: Record<string, boolean>
}>('assetsViewRef')

const columnVisibility = computed({
  get: () => assetsViewRef.value?.columnVisibility ?? {},
  set: (val) => {
    if (assetsViewRef.value) assetsViewRef.value.columnVisibility = val
  },
})

provide(investmentsLayoutKey, {
  table: computed(() => assetsViewRef.value?.table),
  columnVisibility,
  openCreate: () => assetsViewRef.value?.openCreateAsset(),
  createLabel: 'Dodaj aktywo',
  loading: computed(() => assetsStore.loading),
  onRefresh: refresh,
})
</script>

<template>
  <WrappersInvestments>
    <InvestmentsAssetsView
      ref="assetsViewRef"
      :assets="assets"
      :loading="assetsStore.loading"
      :unallocated-map="new Map()"
      @change="refresh"
    />
  </WrappersInvestments>
</template>
