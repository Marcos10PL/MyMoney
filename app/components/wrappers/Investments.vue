<script setup lang="ts">
const TABS = {
  ASSETS: 'assets',
  PORTFOLIOS: 'portfolios',
} as const

const route = useRoute()
const router = useRouter()

const layout = inject(investmentsLayoutKey)

const columnVisibility = computed({
  get: () => layout?.columnVisibility?.value ?? {},
  set: (val) => {
    if (layout && layout.columnVisibility) layout.columnVisibility.value = val
  },
})
const activeTable = computed(() => layout?.table?.value)
const activeLoading = computed(() => layout?.loading?.value ?? false)

const activeTab = computed({
  get: () =>
    route.path.startsWith(LINKS.ASSETS) ? TABS.ASSETS : TABS.PORTFOLIOS,
  set: (value) => {
    router.push(value === TABS.ASSETS ? LINKS.ASSETS : LINKS.PORTFOLIOS)
  },
})

const tabItems = [
  { label: 'Portfele', value: TABS.PORTFOLIOS, icon: 'i-lucide-pie-chart' },
  { label: 'Aktywa', value: TABS.ASSETS, icon: 'i-lucide-layers' },
]
</script>

<template>
  <div>
    <SubHeader
      v-model="columnVisibility"
      title="Inwestycje"
      :refresh-loading="activeLoading"
      :table="activeTable"
      create-button
      :create-label="layout?.createLabel ?? ''"
      @refresh="layout?.onRefresh()"
      @create="layout?.openCreate()"
    />

    <UTabs v-model="activeTab" :items="tabItems" class="mt-4 md:max-w-lg" />

    <slot />
  </div>
</template>
