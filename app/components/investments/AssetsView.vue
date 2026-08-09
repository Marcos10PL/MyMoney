<script setup lang="ts">
import {
  UBadge,
  UButton,
  UIcon,
  UiAmount,
  UiNotesCell,
  UTooltip,
} from '#components'
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
const deleteAssetLoading = ref(false)
const buyModal = ref(false)
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

const openBuyModal = (a: Asset) => {
  selectedAsset.value = a
  buyModal.value = true
}

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

const profitClass = (profit: number) =>
  profit > 0 ? 'text-success' : profit < 0 ? 'text-error' : ''

const router = useRouter()

const navLinkBtn = (to: string, icon: string, tooltip: string) =>
  h(
    UTooltip,
    { text: tooltip },
    {
      default: () =>
        h(UButton, {
          icon,
          size: 'xs',
          variant: 'soft',
          color: 'neutral',
          class: 'shrink-0',
          onClick: () => {
            router.push(to)
          },
        }),
    }
  )

const profitCell = (
  value: number,
  percent: number | null,
  display: () => string
) =>
  percent === null
    ? h('span', '—')
    : h('span', { class: profitClass(value) }, display())

const assetColumns = [
  ...createColumns<Asset>(
    [
      'name',
      'type',
      'accounts',
      'currentValue',
      'costBasis',
      'profit',
      'profitPercent',
    ],
    {
      type: {
        mapValue: (_, row) =>
          h(
            UBadge,
            {
              variant: 'subtle',
              color: 'neutral',
              class: 'border',
              style: { borderColor: ASSET_TYPE_COLORS[row.type], opacity: 0.9 },
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
                  .map((a) =>
                    a.bankName ? `${a.name} (${a.bankName})` : a.name
                  )
                  .join(', '),
              }),
      },
      currentValue: {
        mapValue: (_, row) => {
          const free = props.unallocatedMap.get(row.id)
          const warnEl = free
            ? h(
                UTooltip,
                { text: `${formatCurrency(free)} nieprzydzielone` },
                {
                  default: () =>
                    h(UIcon, {
                      name: 'i-lucide-triangle-alert',
                      class: 'text-warning shrink-0',
                    }),
                }
              )
            : null
          return h(
            'div',
            { class: 'flex items-center gap-1.5' },
            [
              h(UiAmount, {
                value: row.currentValue,
                options: { includeZero: true },
              }),
              warnEl,
              navLinkBtn(
                `/investments/assets/${row.id}/history`,
                'i-lucide-history',
                'Historia wartości'
              ),
            ].filter(Boolean)
          )
        },
      },
      costBasis: {
        mapValue: (_, row) =>
          h('div', { class: 'flex items-center gap-1.5' }, [
            row.costBasis > 0
              ? h(UiAmount, { value: row.costBasis })
              : h('span', '—'),
            navLinkBtn(
              `/investments/assets/${row.id}/transactions`,
              'i-lucide-list',
              'Historia transakcji'
            ),
          ]),
      },
      profit: {
        mapValue: (_, row) =>
          profitCell(row.profit, row.profitPercent, () =>
            formatCurrency(row.profit)
          ),
      },
      profitPercent: {
        mapValue: (_, row) =>
          profitCell(row.profit, row.profitPercent, () => {
            const sign = row.profitPercent! > 0 ? '+' : ''
            return `${sign}${formatNumber(row.profitPercent!)}%`
          }),
      },
    }
  ),
  createActionColumn<Asset>('Akcje', [
    {
      icon: 'i-lucide-shopping-cart',
      tooltip: 'Kup / Sprzedaj',
      color: 'warning',
      onClick: openBuyModal,
    },
    { edit: true, onClick: openEditAsset },
    { delete: true, onClick: openDeleteAsset },
  ]),
]

const onAssetSuccess = () => {
  assetModal.value = false
  emit('change')
}

const onBuySuccess = () => {
  buyModal.value = false
  emit('change')
}

const table = useTemplateRef('table')
const columnVisibility = useLocalStorage('table-columns-investments-assets', {})

defineExpose({ openCreateAsset, table, columnVisibility })
</script>

<template>
  <div class="mt-4">
    <UTable
      ref="table"
      v-model:column-visibility="columnVisibility"
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

    <ModalFormInvestmentBuy
      v-model:open="buyModal"
      :preselected-asset-id="selectedAsset?.id"
      @success="onBuySuccess"
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
