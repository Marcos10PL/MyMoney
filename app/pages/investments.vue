<script setup lang="ts">
const {
  data: assetsData,
  refresh: refreshAssets,
  pending: assetsPending,
} = useLazyFetch<APIResponse<Asset[]>>('/api/investments/assets')
const {
  data: portfoliosData,
  refresh: refreshPortfolios,
  pending: portfoliosPending,
} = useLazyFetch<APIResponse<Portfolio[]>>('/api/investments/portfolios')

const TABS = {
  ASSETS: 'assets',
  PORTFOLIOS: 'portfolios',
} as const

const route = useRoute()
const router = useRouter()

const assets = computed(() => assetsData.value?.data ?? [])
const portfolios = computed(() => portfoliosData.value?.data ?? [])
const loading = computed(() => assetsPending.value || portfoliosPending.value)

const unallocatedMap = computed(() => {
  const result = new Map<string, number>()
  for (const asset of assets.value) {
    let allocated = 0
    let hasExplicit = false
    let hasNull = false

    for (const portfolio of portfolios.value) {
      for (const entry of portfolio.assets) {
        if (entry.asset.id !== asset.id) continue
        if (entry.allocatedAmount != null) {
          allocated += parseFloat(entry.allocatedAmount)
          hasExplicit = true
        } else {
          hasNull = true
        }
      }
    }

    if (hasNull) continue
    if (hasExplicit) {
      const free = asset.currentValue - allocated
      if (free > 0.005) result.set(asset.id, free)
    }
  }
  return result
})

const refreshAll = () => Promise.all([refreshAssets(), refreshPortfolios()])

const assetsViewRef = ref<{ openCreateAsset: () => void }>()
const portfoliosViewRef = ref<{ openCreatePortfolio: () => void }>()

const handleCreate = () => {
  if (activeTab.value === TABS.ASSETS) assetsViewRef.value?.openCreateAsset()
  else portfoliosViewRef.value?.openCreatePortfolio()
}

const activeTab = computed({
  get: () =>
    typeof route.query.tab === 'string' &&
    Object.values(TABS).includes(route.query.tab as never)
      ? route.query.tab
      : TABS.ASSETS,
  set: (value) => {
    router.replace({ query: { ...route.query, tab: value } })
  },
})

const tabItems = [
  {
    label: 'Portfele',
    value: TABS.PORTFOLIOS,
    slot: TABS.PORTFOLIOS,
    icon: 'i-lucide-pie-chart',
  },
  {
    label: 'Aktywa',
    value: TABS.ASSETS,
    slot: TABS.ASSETS,
    icon: 'i-lucide-layers',
  },
]
</script>

<template>
  <div>
    <SubHeader
      title="Inwestycje"
      :refresh-loading="loading"
      create-button
      :create-label="
        activeTab === TABS.ASSETS ? 'Dodaj aktywo' : 'Dodaj portfel'
      "
      @refresh="refreshAll"
      @create="handleCreate"
    />

    <UTabs
      v-model="activeTab"
      :items="tabItems"
      :default-value="TABS.PORTFOLIOS"
      class="mt-4"
    >
      <template #assets>
        <InvestmentsAssetsView
          ref="assetsViewRef"
          :assets="assets"
          :loading="assetsPending"
          :unallocated-map="unallocatedMap"
          @change="refreshAll"
        />
      </template>
      <template #portfolios>
        <InvestmentsPortfoliosView
          ref="portfoliosViewRef"
          :portfolios="portfolios"
          :assets="assets"
          :loading="portfoliosPending"
          :on-refresh="refreshPortfolios"
        />
      </template>
    </UTabs>
  </div>
</template>
