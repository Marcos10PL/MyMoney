<script setup lang="ts">
import { h } from 'vue'

const route = useRoute()
const id = route.params.id as string

const assetsStore = useAssetsStore()
onMounted(() => assetsStore.fetchAssets())
const asset = computed(() => assetsStore.assets.find((a) => a.id === id))

const { data, pending, refresh } = useLazyFetch<APIResponse<AssetSnapshot[]>>(
  `/api/investments/assets/${id}/snapshots`
)
const snapshots = computed(() => (data.value?.data ?? []).slice().reverse())

const { showError, showSuccess } = useToasts()

// --- add/edit ----
const valueModal = ref(false)
const editRow = ref<AssetSnapshot | null>(null)

const openAdd = () => {
  editRow.value = null
  valueModal.value = true
}

const openEdit = (s: AssetSnapshot) => {
  editRow.value = s
  valueModal.value = true
}

const onValueSuccess = async () => {
  valueModal.value = false
  await refresh()
  assetsStore.fetchAssets({ force: true })
}

// ---- delete ----
const deleteModal = ref(false)
const deleteSnapshot = ref<AssetSnapshot | null>(null)
const deleteLoading = ref(false)

const openDelete = (s: AssetSnapshot) => {
  deleteSnapshot.value = s
  deleteModal.value = true
}

const handleDelete = async () => {
  if (!deleteSnapshot.value) return
  deleteLoading.value = true
  try {
    await $fetch(
      `/api/investments/assets/${id}/snapshots/${deleteSnapshot.value.id}`,
      {
        method: 'DELETE',
      }
    )
    showSuccess('Pomiar został usunięty')
    deleteModal.value = false
    await refresh()
    assetsStore.fetchAssets({ force: true })
  } catch {
    showError('Nie udało się usunąć pomiaru')
  } finally {
    await modalCloseAnimation()
    deleteLoading.value = false
  }
}

// ---- columns ----
const deltaClass = (v: number | null) =>
  v === null
    ? 'text-muted'
    : v > 0
      ? 'text-success'
      : v < 0
        ? 'text-error'
        : 'text-muted'

const fmtDelta = (abs: number | null, pct: number | null) => {
  if (abs === null) return '—'
  const sign = abs > 0 ? '+' : ''
  const p = pct !== null ? ` (${sign}${formatNumber(pct)}%)` : ''
  return `${sign}${formatCurrency(abs)}${p}`
}

const columns = [
  ...createColumns<AssetSnapshot>(['date', 'value', 'vsPrev', 'vsFirst'], {
    value: { mapValue: (v) => formatCurrency(v as number) },
    vsPrev: {
      mapValue: (_, row) =>
        h(
          'span',
          { class: deltaClass(row.vsPrev) },
          fmtDelta(row.vsPrev, row.vsPrevPercent)
        ),
    },
    vsFirst: {
      mapValue: (_, row) =>
        h(
          'span',
          { class: deltaClass(row.vsFirst) },
          fmtDelta(row.vsFirst, row.vsFirstPercent)
        ),
    },
  }),
  createActionColumn<AssetSnapshot>('Akcje', [
    { edit: true, onClick: openEdit },
    { delete: true, onClick: openDelete },
  ]),
]

const table = useTemplateRef('table')
const columnVisibility = useLocalStorage(
  `table-columns-asset-history-${id}`,
  {}
)
</script>

<template>
  <div>
    <SubHeader
      v-model="columnVisibility"
      :title="`${asset?.name ?? '…'} — Historia wartości`"
      :refresh-loading="pending"
      :table="table"
      create-button
      back-button
      create-label="Nowy pomiar"
      @refresh="refresh()"
      @create="openAdd"
    />

    <UTable
      ref="table"
      v-model:column-visibility="columnVisibility"
      :data="snapshots"
      :columns="columns"
      :loading="pending"
      :empty="pending ? 'Ładowanie…' : 'Brak pomiarów'"
      class="mt-4"
    />

    <ModalFormAssetValue
      v-model:open="valueModal"
      :asset-id="id"
      :row="editRow"
      @success="onValueSuccess"
    />

    <UiConfirmModal
      v-model:open="deleteModal"
      :title="`Usuń pomiar z ${deleteSnapshot?.date ?? ''}?`"
      description="Tej operacji nie można cofnąć."
      :loading="deleteLoading"
      @confirm="handleDelete"
    />
  </div>
</template>
