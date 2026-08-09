<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string

const assetsStore = useAssetsStore()
onMounted(() => assetsStore.fetchAssets())

const { data, pending, refresh } = useLazyFetch<
  APIResponse<AssetPerformanceData>
>(`/api/investments/assets/${id}/performance`)

const perf = computed(() => data.value?.data)
const snapshots = computed(() => perf.value?.snapshots ?? [])
const txs = computed(() => perf.value?.transactions ?? [])
const yearlyPerf = useYearlyPerf(snapshots, txs)

const valueModal = ref(false)
const editRow = ref<AssetSnapshot | null>(null)
const historyRef = useTemplateRef<{ refresh: () => void }>('historyRef')

const historyOpen = ref(false)
const historyLoaded = ref(false)

const toggleHistory = () => {
  historyOpen.value = !historyOpen.value
  if (!historyLoaded.value && historyOpen.value) historyLoaded.value = true
}

const openAdd = () => {
  editRow.value = null
  valueModal.value = true
}

const openEdit = (row: AssetSnapshot) => {
  editRow.value = row
  valueModal.value = true
}

const onValueSuccess = async () => {
  valueModal.value = false
  await refresh()
  historyRef.value?.refresh()
  assetsStore.fetchAssets({ force: true })
}

const onHistoryChange = async () => {
  await refresh()
  assetsStore.fetchAssets({ force: true })
}

provide(assetDetailLayoutKey, {
  createLabel: 'Nowy pomiar',
  openCreate: openAdd,
  loading: computed(() => pending.value),
  onRefresh: () => refresh(),
})
</script>

<template>
  <WrappersAssetDetail>
    <div class="mt-4 space-y-6">
      <div class="rounded-lg border border-default p-4">
        <InvestmentsAssetChart
          :snapshots="perf?.snapshots ?? []"
          :transactions="perf?.transactions"
          :loading="pending"
        />
      </div>

      <div>
        <p class="text-sm font-semibold uppercase tracking-wide mb-3 px-3">
          Wyniki roczne
        </p>
        <InvestmentsYearlyPerfTable :data="yearlyPerf" :loading="pending" />
      </div>

      <UButton
        variant="ghost"
        class="w-full uppercase py-2 justify-between"
        color="neutral"
        :trailing-icon="
          historyOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
        "
        @click="toggleHistory"
      >
        Historia wartości rynkowej
      </UButton>
      <div v-if="historyLoaded" v-show="historyOpen">
        <InvestmentsAssetHistory
          ref="historyRef"
          :asset-id="id"
          @edit="openEdit"
          @change="onHistoryChange"
        />
      </div>
    </div>

    <ModalFormAssetValue
      v-model:open="valueModal"
      :asset-id="id"
      :row="editRow"
      @success="onValueSuccess"
    />
  </WrappersAssetDetail>
</template>
