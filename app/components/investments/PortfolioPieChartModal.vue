<script setup lang="ts">
const { portfolio } = defineProps<{ portfolio: Portfolio | null }>()
const open = defineModel<boolean>('open', { default: false })

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const series = computed(
  () => portfolio?.assets.map((a) => a.effectiveValue) ?? []
)

const options = computed(() => ({
  chart: {
    type: 'donut',
    background: 'transparent',
    fontFamily: 'inherit',
    animations: { enabled: false },
  },
  theme: { mode: isDark.value ? 'dark' : 'light' },
  colors:
    portfolio?.assets.map((a) => ASSET_TYPE_META[a.asset.type].color) ?? [],
  labels: portfolio?.assets.map((a) => a.asset.name) ?? [],
  legend: { position: 'bottom', fontSize: '12px' },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(1)}%`,
  },
  tooltip: {
    y: { formatter: (val: number) => formatCurrency(val) },
  },
  plotOptions: {
    pie: { donut: { size: '60%' } },
  },
}))
</script>

<template>
  <UModal v-model:open="open" :title="portfolio?.name ?? ''" size="sm">
    <template v-if="portfolio" #description>
      <span class="font-mono font-semibold text-foreground">
        <UiAmount
          :value="portfolio.totalValue"
          :options="{ includeZero: true }"
        />
      </span>
    </template>
    <template #body>
      <div
        v-if="!portfolio || portfolio.assets.length === 0"
        class="text-center text-muted py-4"
      >
        Brak aktywów w portfelu.
      </div>
      <ClientOnly v-else>
        <apexchart
          type="donut"
          :options="options"
          :series="series"
          height="300"
          class="w-full"
        />
        <template #fallback>
          <div class="h-40 flex items-center justify-center text-muted text-sm">
            Ładowanie wykresu…
          </div>
        </template>
      </ClientOnly>
    </template>
  </UModal>
</template>
