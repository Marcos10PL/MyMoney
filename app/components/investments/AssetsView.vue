<script setup lang="ts">
import { UBadge, UIcon, UiAmount, UiNotesCell, UTooltip } from '#components'
import { h } from 'vue'

const props = defineProps<{
  assets: Asset[]
  loading: boolean
  unallocatedMap: Map<string, number>
}>()

const emit = defineEmits<{ change: [] }>()

const { showError, showSuccess } = useToasts()

const assetModal = ref(false)
const deleteAssetModal = ref(false)
const selectedAsset = ref<Asset | null>(null)

const openCreateAsset = () => {
  selectedAsset.value = null
  assetModal.value = true
}
const openEditAsset = (a: Asset) => {
  selectedAsset.value = a
  assetModal.value = true
}
const openDeleteAsset = (a: Asset) => {
  selectedAsset.value = a
  deleteAssetModal.value = true
}

const deleteAssetLoading = ref(false)
const handleDeleteAsset = async () => {
  if (!selectedAsset.value) return
  deleteAssetLoading.value = true
  try {
    await $fetch(`/api/investments/assets/${selectedAsset.value.id}`, {
      method: 'DELETE',
    })
    showSuccess('Aktywo zostało usunięte')
    deleteAssetModal.value = false
    emit('change')
  } catch {
    showError('Nie udało się usunąć aktywa')
  } finally {
    await modalCloseAnimation()
    deleteAssetLoading.value = false
  }
}

const assetColumns = [
  ...createColumns<Asset>(['name', 'type', 'accounts', 'currentValue'], {
    type: {
      mapValue: (_, row) =>
        h(
          UBadge,
          {
            variant: 'subtle',
            color: 'neutral',
            class: 'border',
            style: {
              borderColor: `${ASSET_TYPE_COLORS[row.type]}`,
              opacity: 0.9,
            },
          },
          ASSET_TYPES_LABELS[row.type]
        ),
    },
    accounts: {
      mapValue: (_, row) =>
        row.accounts.length === 0
          ? '—'
          : h(UiNotesCell, {
              text: row.accounts
                .map((a) => (a.bankName ? `${a.name} (${a.bankName})` : a.name))
                .join(', '),
            }),
    },
    currentValue: {
      mapValue: (_, row) => {
        const free = props.unallocatedMap.get(row.id)
        const valueEl = h(UiAmount, {
          value: row.currentValue,
          options: { includeZero: true },
        })
        if (!free) return valueEl
        return h('div', { class: 'flex items-center gap-1.5' }, [
          valueEl,
          h(
            UTooltip,
            { text: `${formatCurrency(free)} nieprzydzielone` },
            {
              default: () =>
                h(UIcon, {
                  name: 'i-lucide-triangle-alert',
                  class: 'text-warning shrink-0',
                }),
            }
          ),
        ])
      },
    },
  }),
  createActionColumn<Asset>('Akcje', [
    { edit: true, onClick: openEditAsset },
    { delete: true, onClick: openDeleteAsset },
  ]),
]

const onAssetSuccess = () => {
  assetModal.value = false
  emit('change')
}

defineExpose({ openCreateAsset })
</script>

<template>
  <div class="mt-4">
    <UTable
      :data="props.assets"
      :columns="assetColumns"
      :loading="props.loading"
      :empty="props.loading ? 'Ładowanie...' : 'Brak aktywów do wyświetlenia'"
    />

    <ModalFormAsset
      v-model:open="assetModal"
      :row="selectedAsset"
      @success="onAssetSuccess"
    />

    <UiConfirmModal
      v-model:open="deleteAssetModal"
      :title="`Usuń aktywo '${selectedAsset?.name ?? ''}'`"
      description="Tej operacji nie można cofnąć."
      :loading="deleteAssetLoading"
      @confirm="handleDeleteAsset"
    />
  </div>
</template>
