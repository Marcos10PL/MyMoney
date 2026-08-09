<script setup lang="ts">
import { h } from 'vue'
import type { TableColumn } from '@nuxt/ui'

defineProps<{
  data: AssetYearlyPerf[]
  loading?: boolean
}>()

const colorCell = (value: number | null, fmt: () => string) => {
  if (value === null) return h('span', { class: 'text-muted' }, '—')
  const cls = value > 0 ? 'text-success' : value < 0 ? 'text-error' : ''
  return h('span', { class: cls }, fmt())
}

const columns = createColumns<AssetYearlyPerf & Record<string, unknown>>(
  ['year', 'startValue', 'netInvested', 'endValue', 'gain', 'returnPercent'],
  {
    startValue: { isCurrency: true },
    endValue: { isCurrency: true },
    netInvested: { isCurrency: true },
    gain: {
      mapValue: (_, r) =>
        colorCell(
          r.gain as number | null,
          () => `${r.gain! > 0 ? '+' : ''}${formatCurrency(r.gain!)}`
        ),
    },
    returnPercent: {
      mapValue: (_, r) =>
        colorCell(
          r.returnPercent as number | null,
          () =>
            `${r.returnPercent! > 0 ? '+' : ''}${formatNumber(r.returnPercent!)}%`
        ),
    },
  }
) as TableColumn<AssetYearlyPerf>[]
</script>

<template>
  <UTable
    :data="data"
    :columns="columns"
    :loading="loading"
    :empty="
      loading ? 'Ładowanie…' : 'Brak danych - dodaj pomiary wartości rynkowej'
    "
  />
</template>
