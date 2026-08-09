<script setup lang="ts">
const { assetId } = defineProps<{ assetId: string }>()

const { data, pending, refresh } = useLazyFetch<APIResponse<AssetSnapshot[]>>(
  `/api/investments/assets/${assetId}/snapshots`
)

const snapshots = computed(() => (data.value?.data ?? []).slice().reverse())

const deltaClass = (v: number | null) => {
  if (v === null) return 'text-muted'
  return v > 0 ? 'text-success' : v < 0 ? 'text-error' : 'text-muted'
}

const formatDelta = (abs: number | null, pct: number | null) => {
  if (abs === null) return '—'
  const sign = abs > 0 ? '+' : ''
  const pctStr = pct !== null ? ` (${sign}${formatNumber(pct)}%)` : ''
  return `${sign}${formatCurrency(abs)}${pctStr}`
}

const { showError, showSuccess } = useToasts()
const deleting = ref<string | null>(null)

const deleteSnapshot = async (snapshotId: string) => {
  deleting.value = snapshotId
  try {
    await $fetch(`/api/investments/assets/${assetId}/snapshots/${snapshotId}`, {
      method: 'DELETE',
    })
    showSuccess('Pomiar został usunięty')
    await refresh()
  } catch {
    showError('Nie udało się usunąć pomiaru')
  } finally {
    deleting.value = null
  }
}

defineExpose({ refresh })
</script>

<template>
  <div>
    <p class="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
      Historia wartości rynkowej
    </p>

    <div v-if="pending" class="py-2 text-sm text-muted">Ładowanie...</div>

    <div v-else-if="snapshots.length === 0" class="py-2 text-sm text-muted">
      Brak historii. Użyj przycisku "Aktualizuj wartość" (ikona wykresu), aby
      zapisać pierwszy pomiar.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-default text-muted text-left">
            <th class="pb-1.5 pr-4 font-medium">Data</th>
            <th class="pb-1.5 pr-4 font-medium text-right">Wartość</th>
            <th class="pb-1.5 pr-4 font-medium text-right">vs poprzedni</th>
            <th class="pb-1.5 pr-4 font-medium text-right">vs pierwszy</th>
            <th class="pb-1.5 font-medium" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="s in snapshots"
            :key="s.id"
            class="border-b border-default/50 last:border-0"
          >
            <td class="py-1.5 pr-4 font-mono text-xs text-muted">
              {{ s.date }}
            </td>
            <td class="py-1.5 pr-4 text-right font-mono font-semibold">
              {{ formatCurrency(s.value) }}
            </td>
            <td
              class="py-1.5 pr-4 text-right font-mono text-xs"
              :class="deltaClass(s.vsPrev)"
            >
              {{ formatDelta(s.vsPrev, s.vsPrevPercent) }}
            </td>
            <td
              class="py-1.5 pr-4 text-right font-mono text-xs"
              :class="deltaClass(s.vsFirst)"
            >
              {{ formatDelta(s.vsFirst, s.vsFirstPercent) }}
            </td>
            <td class="py-1.5">
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="xs"
                :loading="deleting === s.id"
                @click="deleteSnapshot(s.id)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
