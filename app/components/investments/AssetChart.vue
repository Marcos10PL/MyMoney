<script setup lang="ts">
const props = defineProps<{
  snapshots: { date: string; value: number }[]
  transactions?: { date: string; type: string; amount: number }[]
  loading?: boolean
}>()

const colorMode = useColorMode()

type Period = '1m' | '3m' | '6m' | '1y' | '3y' | '5y' | 'all'
const period = ref<Period>('6m')

const periodOptions: { label: string; value: Period; months?: number }[] = [
  { label: '1M', value: '1m', months: 1 },
  { label: '3M', value: '3m', months: 3 },
  { label: '6M', value: '6m', months: 6 },
  { label: '1R', value: '1y', months: 12 },
  { label: '3L', value: '3y', months: 36 },
  { label: '5L', value: '5y', months: 60 },
  { label: 'Max', value: 'all' },
]

const cutoff = computed(() => {
  const opt = periodOptions.find((o) => o.value === period.value)
  if (!opt?.months) return null
  const d = new Date()
  d.setMonth(d.getMonth() - opt.months)
  return d
})

const clippedData = computed(() => {
  const c = cutoff.value
  if (!c) return props.snapshots
  return props.snapshots.filter((s) => new Date(s.date) >= c)
})

const clippedTx = computed(() => {
  const c = cutoff.value
  if (!c) return props.transactions ?? []
  return (props.transactions ?? []).filter((t) => new Date(t.date) >= c)
})

// --- zoom tracking ---
const zoomedRange = ref<{ min: number; max: number } | null>(null)

const setPeriod = (p: Period) => {
  period.value = p
  zoomedRange.value = null
}

const visibleSnapshots = computed(() => {
  const r = zoomedRange.value
  if (!r) return clippedData.value
  const DAY = 86400000
  return clippedData.value.filter((s) => {
    const t = new Date(s.date).getTime()
    return t >= r.min - DAY && t <= r.max + DAY
  })
})

const visibleTx = computed(() => {
  const d = visibleSnapshots.value
  if (d.length < 2) return []
  const firstDate = d[0]!.date
  const lastDate = d[d.length - 1]!.date
  return clippedTx.value.filter((t) => t.date > firstDate && t.date <= lastDate)
})

const periodStats = computed(() => {
  const d = visibleSnapshots.value
  if (d.length < 2) return null
  const first = d[0]!.value
  const last = d[d.length - 1]!.value

  const netInvested = visibleTx.value.reduce(
    (sum, t) =>
      sum +
      (t.type === TRANSACTION_TYPES.INVESTMENT_BUY ? t.amount : -t.amount),
    0
  )
  const gain = last - first - netInvested
  const denom = first + netInvested * 0.5
  const gainPct = denom > 0 ? (gain / denom) * 100 : null

  return { last, gain, gainPct, netInvested }
})

const sortedTx = computed(() =>
  [...(props.transactions ?? [])].sort((a, b) => a.date.localeCompare(b.date))
)

const costBasisSeries = computed(() => {
  const tx = sortedTx.value
  if (tx.length === 0) return []

  const points: [number, number][] = []
  let cumulative = 0
  let txIndex = 0

  for (const s of clippedData.value) {
    while (txIndex < tx.length && tx[txIndex]!.date <= s.date) {
      const t = tx[txIndex]!
      cumulative +=
        t.type === TRANSACTION_TYPES.INVESTMENT_BUY ? t.amount : -t.amount
      txIndex++
    }
    points.push([new Date(s.date).getTime(), cumulative])
  }

  return points
})

const series = computed(() => [
  {
    name: 'Wartość rynkowa',
    data: clippedData.value.map((s) => [new Date(s.date).getTime(), s.value]),
  },
  ...(costBasisSeries.value.length > 0
    ? [
        {
          name: 'Kapitał zainwestowany',
          data: costBasisSeries.value,
        },
      ]
    : []),
])

const isDark = computed(() => colorMode.value === 'dark')

const yAxisFormatter = (val: number) =>
  formatCurrency(val, { fractionDigits: 0 })
const tooltipYFormatter = (val: number) => formatCurrency(val)
const xAxisDateFormatter = (val: number) => formatDate(new Date(val))

const chartEvents = {
  mounted: (ctx: { updateSeries: (s: unknown[], redraw: boolean) => void }) => {
    ctx.updateSeries(series.value, false)
  },
  zoomed: (
    _ctx: unknown,
    { xaxis }: { xaxis: { min: number; max: number } }
  ) => {
    zoomedRange.value = { min: xaxis.min, max: xaxis.max }
  },
  scrolled: (
    _ctx: unknown,
    { xaxis }: { xaxis: { min: number; max: number } }
  ) => {
    zoomedRange.value = { min: xaxis.min, max: xaxis.max }
  },
  beforeResetZoom: () => {
    zoomedRange.value = null
  },
}

const options = computed(() => ({
  chart: {
    type: 'area',
    background: 'transparent',
    events: chartEvents,
    toolbar: {
      show: true,
      tools: {
        download: false,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true,
      },
    },
    zoom: { enabled: true, autoScaleYaxis: true },
    animations: { enabled: false },
    fontFamily: 'inherit',
  },
  theme: { mode: isDark.value ? 'dark' : 'light' },
  colors: ['#3b82f6', '#94a3b8'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: [2, 2], dashArray: [0, 4] },
  fill: {
    type: ['gradient', 'solid'],
    opacity: [1, 0],
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.25,
      opacityTo: 0.02,
      stops: [0, 100],
    },
  },
  legend: { show: false },
  grid: {
    borderColor: isDark.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeUTC: false,
      style: { fontSize: '11px' },
      formatter: xAxisDateFormatter,
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      formatter: yAxisFormatter,
      style: { fontSize: '11px' },
    },
  },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    x: { formatter: xAxisDateFormatter },
    y: { formatter: tooltipYFormatter },
  },
  annotations: {
    xaxis: clippedTx.value.map((t) => {
      const isBuy = t.type === TRANSACTION_TYPES.INVESTMENT_BUY
      const color = isBuy ? '#22c55e' : '#ef4444'
      return {
        x: new Date(t.date).getTime(),
        borderColor: color,
        strokeDashArray: 0,
        borderWidth: 2,
        label: {
          text:
            (isBuy ? '+ ' : '− ') +
            formatCurrency(t.amount, { fractionDigits: 0 }),
          borderWidth: 0,
          style: {
            color,
            background: 'transparent',
            fontSize: '10px',
            fontFamily: 'inherit',
            fontWeight: '600',
          },
          offsetY: -4,
        },
      }
    }),
  },
}))
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-4">
      <div v-if="periodStats" class="flex items-center gap-2 leading-tight">
        <span class="font-mono font-semibold text-sm">
          {{ formatCurrency(periodStats.last) }}</span
        >
        <div
          class="font-mono text-xs"
          :class="
            periodStats.gain > 0
              ? 'text-success'
              : periodStats.gain < 0
                ? 'text-error'
                : 'text-muted'
          "
        >
          {{ periodStats.gain >= 0 ? '+' : '−'
          }}{{ formatCurrency(Math.abs(periodStats.gain)) }}
          <span v-if="periodStats.gainPct !== null">
            ({{ periodStats.gainPct > 0 ? '+' : ''
            }}{{ formatNumber(periodStats.gainPct) }}%)
          </span>
        </div>
      </div>

      <div class="flex gap-1 ml-auto">
        <UButton
          v-for="opt in periodOptions"
          :key="opt.value"
          :label="opt.label"
          size="xs"
          :variant="period === opt.value ? 'solid' : 'ghost'"
          color="neutral"
          class="cursor-pointer"
          @click="() => setPeriod(opt.value)"
        />
      </div>
    </div>

    <div
      v-if="loading"
      class="h-90 flex items-center justify-center text-sm text-muted"
    >
      Ładowanie…
    </div>

    <div
      v-else-if="snapshots.length < 2"
      class="flex items-center justify-center h-40 text-sm text-muted"
    >
      {{
        snapshots.length === 0
          ? 'Brak pomiarów do wyświetlenia wykresu.'
          : 'Potrzeba co najmniej 2 pomiarów.'
      }}
    </div>

    <ClientOnly v-else>
      <apexchart
        :key="period"
        type="area"
        height="320"
        :options="options"
        :series="series"
        class="w-full"
      />
      <template #fallback>
        <div class="h-60 flex items-center justify-center text-muted text-sm">
          Ładowanie wykresu…
        </div>
      </template>
    </ClientOnly>

    <div
      v-if="(transactions?.length ?? 0) > 0"
      class="flex flex-wrap gap-4 mt-2 text-xs text-muted"
    >
      <span class="flex items-center gap-1.5">
        <span class="inline-block size-2 rounded-full bg-[#3b82f6]" /> Wartość
        rynkowa
      </span>
      <span v-if="costBasisSeries.length > 0" class="flex items-center gap-1.5">
        <span class="inline-block size-2 rounded-full bg-[#94a3b8]" /> Kapitał
        zainwestowany
      </span>
      <span class="flex items-center gap-1.5">
        <span class="inline-block size-2 rounded-full bg-success" /> Zakup
      </span>
      <span class="flex items-center gap-1.5">
        <span class="inline-block size-2 rounded-full bg-error" /> Sprzedaż
      </span>
    </div>
  </div>
</template>
