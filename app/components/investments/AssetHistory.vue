<script setup lang="ts">
const { assetId } = defineProps<{ assetId: string }>()
const emit = defineEmits<{
  edit: [snapshot: AssetSnapshot]
  change: []
}>()

const { data, pending, refresh } = useLazyFetch<APIResponse<AssetSnapshot[]>>(
  `/api/investments/assets/${assetId}/snapshots`
)

const snapshots = computed(() => (data.value?.data ?? []).slice().reverse())

const { showError, showSuccess } = useToasts()
const deleteModal = ref(false)
const deleting = ref(false)
const selected = ref<AssetSnapshot | null>(null)

const openDelete = (row: AssetSnapshot) => {
  selected.value = row
  deleteModal.value = true
}

const handleDelete = async () => {
  if (!selected.value) return
  deleting.value = true
  try {
    await $fetch(
      `/api/investments/assets/${assetId}/snapshots/${selected.value.id}`,
      { method: 'DELETE' }
    )
    showSuccess('Pomiar został usunięty')
    deleteModal.value = false
    await refresh()
    emit('change')
  } catch {
    showError('Nie udało się usunąć pomiaru')
  } finally {
    deleting.value = false
  }
}

const columns = [
  ...createColumns<AssetSnapshot & Record<string, unknown>>(['date', 'value'], {
    date: { isDate: true },
    value: { isCurrency: true },
  }),
  createActionColumn<AssetSnapshot>('', [
    { edit: true, onClick: (row) => emit('edit', row) },
    { delete: true, onClick: openDelete },
  ]),
]

defineExpose({ refresh })
</script>

<template>
  <UTable
    :data="snapshots"
    :columns="columns"
    :loading="pending"
    :empty="pending ? 'Ładowanie...' : 'Brak pomiarów.'"
  />

  <UiConfirmModal
    v-model:open="deleteModal"
    :title="`Usuń pomiar z ${formatDate(selected?.date ?? '')}?`"
    description="Tej operacji nie można cofnąć."
    :loading="deleting"
    @confirm="handleDelete"
  />
</template>
