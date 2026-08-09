<script setup lang="ts">
import { UBadge } from '#components'
import { h } from 'vue'

const route = useRoute()
const id = route.params.id as string

const assetsStore = useAssetsStore()
onMounted(() => assetsStore.fetchAssets())
const asset = computed(() => assetsStore.assets.find((a) => a.id === id))

const { showError, showSuccess } = useToasts()

const { data, pending, refresh } = useLazyFetch<APIResponse<AssetPurchase[]>>(
  `/api/investments/assets/${id}/purchases`
)

// ---- buy/sell modal ----
const buyModal = ref(false)
const editRow = ref<AssetPurchase | null>(null)

const openCreate = () => {
  editRow.value = null
  buyModal.value = true
}

const openEdit = (row: AssetPurchase) => {
  editRow.value = row
  buyModal.value = true
}

const onBuySuccess = async () => {
  buyModal.value = false
  await refresh()
  assetsStore.fetchAssets({ force: true })
}

// ---- delete ----
const deleteModal = ref(false)
const deleteRow = ref<AssetPurchase | null>(null)
const deleteLoading = ref(false)

const openDelete = (row: AssetPurchase) => {
  deleteRow.value = row
  deleteModal.value = true
}

const handleDelete = async () => {
  if (!deleteRow.value) return
  deleteLoading.value = true
  try {
    await $fetch(`/api/transactions/${deleteRow.value.id}`, {
      method: 'DELETE',
    })
    showSuccess('Transakcja została usunięta')
    deleteModal.value = false
    await refresh()
    assetsStore.fetchAssets({ force: true })
  } catch {
    showError('Nie udało się usunąć transakcji')
  } finally {
    await modalCloseAnimation()
    deleteLoading.value = false
  }
}

// ---- columns ----
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
            label: TRANSACTION_TYPES_LABELS[val as never],
          }),
      },
      account: { mapValue: (_, row) => row.account.name },
      amount: { isCurrency: true },
      date: { isDate: true },
    }
  ),
  createActionColumn<AssetPurchase>('Akcje', [
    { edit: true, onClick: openEdit },
    { delete: true, onClick: openDelete },
  ]),
]

const table = useTemplateRef('table')
const columnVisibility = useLocalStorage(
  `table-columns-asset-transactions-${id}`,
  {}
)
</script>

<template>
  <div>
    <SubHeader
      v-model="columnVisibility"
      :title="`${asset?.name ?? '…'} — Historia transakcji`"
      :refresh-loading="pending"
      :table="table"
      create-button
      back-button
      create-label="Zakup/sprzedaż"
      @refresh="refresh()"
      @create="openCreate"
    />

    <UTable
      ref="table"
      v-model:column-visibility="columnVisibility"
      :data="data?.data ?? []"
      :columns="columns"
      :loading="pending"
      :empty="pending ? 'Ładowanie…' : 'Brak transakcji dla tego aktywa'"
      class="mt-4"
    />

    <ModalFormInvestmentBuy
      v-model:open="buyModal"
      :preselected-asset-id="id"
      :row="editRow"
      @success="onBuySuccess"
    />

    <UiConfirmModal
      v-model:open="deleteModal"
      :title="`Usuń transakcję '${deleteRow?.name ?? ''}'?`"
      description="Tej operacji nie można cofnąć."
      :loading="deleteLoading"
      @confirm="handleDelete"
    />
  </div>
</template>
