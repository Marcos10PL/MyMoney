<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const layout = inject(assetDetailLayoutKey)

const id = computed(() => route.params.id as string)

const assetsStore = useAssetsStore()
const asset = computed(() => assetsStore.assets.find((a) => a.id === id.value))

const TABS = { WYNIKI: 'wyniki', TRANSACTIONS: 'transactions' } as const

const activeTab = computed({
  get: () =>
    route.path.endsWith('/transactions') ? TABS.TRANSACTIONS : TABS.WYNIKI,
  set: (val) =>
    router.push(
      val === TABS.TRANSACTIONS
        ? `/investments/assets/${id.value}/transactions`
        : `/investments/assets/${id.value}/history`
    ),
})

const tabItems = [
  { label: 'Wyniki', value: TABS.WYNIKI },
  { label: 'Transakcje', value: TABS.TRANSACTIONS },
]

const columnVisibility = computed({
  get: () => layout?.columnVisibility?.value ?? {},
  set: (val) => {
    if (layout?.columnVisibility) layout.columnVisibility.value = val
  },
})

const activeTable = computed(() => layout?.table?.value ?? null)
const activeLoading = computed(() => layout?.loading.value ?? false)
</script>

<template>
  <div>
    <SubHeader
      v-model="columnVisibility"
      :title="asset?.name ?? '…'"
      :refresh-loading="activeLoading"
      :table="activeTable"
      back-button
      create-button
      :create-label="layout?.createLabel ?? ''"
      @refresh="layout?.onRefresh()"
      @create="layout?.openCreate()"
    />

    <UTabs v-model="activeTab" :items="tabItems" class="mt-4 md:max-w-lg" />

    <slot />
  </div>
</template>
