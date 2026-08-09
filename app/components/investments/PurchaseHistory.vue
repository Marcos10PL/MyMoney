<script setup lang="ts">
import { UBadge } from '#components'
import { h } from 'vue'

const { assetId } = defineProps<{ assetId: string }>()
const emit = defineEmits<{ change: [] }>()

const { showError, showSuccess } = useToasts()

const { data, pending, refresh } = useLazyFetch<APIResponse<AssetPurchase[]>>(
  `/api/investments/assets/${assetId}/purchases`
)

const editModal = ref(false)
const deleteModal = ref(false)
const deleteLoading = ref(false)
const selected = ref<AssetPurchase | null>(null)

const openEdit = (row: AssetPurchase) => {
  selected.value = row
  editModal.value = true
}
const openDelete = (row: AssetPurchase) => {
  selected.value = row
  deleteModal.value = true
}

const handleDelete = async () => {
  if (!selected.value) return
  deleteLoading.value = true
  try {
    await $fetch(`/api/transactions/${selected.value.id}`, { method: 'DELETE' })
    showSuccess('Transakcja została usunięta')
    deleteModal.value = false
    await refresh()
    emit('change')
  } catch {
    showError('Nie udało się usunąć transakcji')
  } finally {
    await modalCloseAnimation()
    deleteLoading.value = false
  }
}

const onEditSuccess = async () => {
  editModal.value = false
  await refresh()
  emit('change')
}

const columns = [
  ...createColumns<AssetPurchase>(
    ['name', 'type', 'account', 'amount', 'quantity', 'date'],
    {
      type: {
        mapValue: (val) =>
          h(UBadge, {
            variant: 'subtle',
            color:
              val === TRANSACTION_TYPES.INVESTMENT_BUY ? 'warning' : 'primary',
            label: TRANSACTION_TYPES_LABELS[val as AppTransactionType],
          }),
      },
      account: {
        mapValue: (_, row) => (row.account as { name: string }).name,
      },
      amount: { isCurrency: true },
      date: { isDate: true },
    }
  ),
  createActionColumn<AssetPurchase>('Akcje', [
    { edit: true, onClick: openEdit },
    { delete: true, onClick: openDelete },
  ]),
]
</script>

<template>
  <div class="py-2 px-4 bg-muted/40 rounded-lg">
    <p class="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
      Historia transakcji
    </p>
    <UTable
      :data="data?.data ?? []"
      :columns="columns"
      :loading="pending"
      :empty="pending ? 'Ładowanie...' : 'Brak transakcji dla tego aktywa'"
      class="text-sm"
    />

    <ModalFormInvestmentBuy
      v-model:open="editModal"
      :row="selected"
      @success="onEditSuccess"
    />

    <UiConfirmModal
      v-model:open="deleteModal"
      :title="`Usuń transakcję '${selected?.name ?? ''}'?`"
      description="Tej operacji nie można cofnąć."
      :loading="deleteLoading"
      @confirm="handleDelete"
    />
  </div>
</template>
