<script setup lang="ts">
import { h } from 'vue'
import { UIcon } from '#components'

const props = defineProps<{
  portfolios: Portfolio[]
  assets: Asset[]
  loading: boolean
  onRefresh: () => Promise<void>
}>()

const { showError, showSuccess } = useToasts()

// ---- PORTFOLIO modals ----
const portfolioModal = ref(false)
const deletePortfolioModal = ref(false)
const selectedPortfolio = ref<Portfolio | null>(null)

const openCreatePortfolio = () => {
  selectedPortfolio.value = null
  portfolioModal.value = true
}
const openEditPortfolio = (p: Portfolio) => {
  selectedPortfolio.value = p
  portfolioModal.value = true
}
const openDeletePortfolio = (p: Portfolio) => {
  selectedPortfolio.value = p
  deletePortfolioModal.value = true
}

const deletePortfolioLoading = ref(false)
const handleDeletePortfolio = async () => {
  if (!selectedPortfolio.value) return
  deletePortfolioLoading.value = true
  try {
    await $fetch(`/api/investments/portfolios/${selectedPortfolio.value.id}`, {
      method: 'DELETE',
    })
    showSuccess('Portfel został usunięty')
    deletePortfolioModal.value = false
    await props.onRefresh()
  } catch {
    showError('Nie udało się usunąć portfela')
  } finally {
    await modalCloseAnimation()
    deletePortfolioLoading.value = false
  }
}

const onPortfolioSuccess = () => {
  portfolioModal.value = false
  props.onRefresh()
}

// ---- CHART ----
const chartModal = ref(false)
const chartPortfolio = ref<Portfolio | null>(null)
const openChart = (p: Portfolio) => {
  chartPortfolio.value = p
  chartModal.value = true
}

const refreshAndSyncChart = async () => {
  await props.onRefresh()
  if (chartPortfolio.value) {
    chartPortfolio.value =
      props.portfolios.find((p) => p.id === chartPortfolio.value!.id) ?? null
  }
}

const portfolioSegments = (portfolio: Portfolio) =>
  portfolio.assets.map((entry) => ({
    label: entry.asset.name,
    value: entry.effectiveValue,
    color: ASSET_TYPE_COLORS[entry.asset.type],
  }))

// ---- PORTFOLIO ASSET modals ----
const paModal = ref(false)
const selectedPA = ref<{
  portfolioId: string
  entry: PortfolioAssetEntry | null
} | null>(null)
const deletePAModal = ref(false)
const deletePALoading = ref(false)

const openAddPA = (portfolioId: string) => {
  selectedPA.value = { portfolioId, entry: null }
  paModal.value = true
}
const openEditPA = (portfolioId: string, entry: PortfolioAssetEntry) => {
  selectedPA.value = { portfolioId, entry }
  paModal.value = true
}
const openDeletePA = (portfolioId: string, entry: PortfolioAssetEntry) => {
  selectedPA.value = { portfolioId, entry }
  deletePAModal.value = true
}

const handleDeletePA = async () => {
  if (!selectedPA.value?.entry) return
  deletePALoading.value = true
  try {
    await $fetch(
      `/api/investments/portfolios/${selectedPA.value.portfolioId}/assets/${selectedPA.value.entry.id}`,
      { method: 'DELETE' }
    )
    showSuccess('Aktywo zostało usunięte z portfela')
    deletePAModal.value = false
    await refreshAndSyncChart()
  } catch {
    showError('Nie udało się usunąć aktywa z portfela')
  } finally {
    await modalCloseAnimation()
    deletePALoading.value = false
  }
}

const onPASuccess = () => {
  paModal.value = false
  refreshAndSyncChart()
}

const columnVisibility = useLocalStorage(
  'table-columns-investments-portfolios',
  {}
)
const firstTable = ref<unknown>(null)
const setFirstTable = (el: unknown, isFirst: boolean) =>
  isFirst && (firstTable.value = el)

defineExpose({ openCreatePortfolio, firstTable, columnVisibility })

// ---- columns ----
type PARow = PortfolioAssetEntry & { _color: string }

const portfolioEntriesWithColor = (portfolio: Portfolio): PARow[] =>
  portfolio.assets.map((entry) => ({
    ...entry,
    _color: ASSET_TYPE_COLORS[entry.asset.type],
  }))

const makePortfolioAssetColumns = (portfolioId: string) => [
  ...createColumns<PARow>(
    ['asset', 'effectiveValue', 'actualPercent', 'targetPercent', 'drift'],
    {
      asset: {
        mapValue: (_, row) =>
          h('div', { class: 'flex items-center gap-2' }, [
            h('span', {
              class: 'w-2.5 h-2.5 rounded-sm shrink-0',
              style: { background: row._color },
            }),
            h('span', {}, row.asset.name),
            row.isDrifting
              ? h(UIcon, {
                  name: 'i-lucide-alert-triangle',
                  class: 'text-error text-sm',
                })
              : null,
          ]),
      },
      effectiveValue: { isCurrency: true },
      actualPercent: {
        mapValue: (_, row) => `${row.actualPercent.toFixed(1)}%`,
      },
      targetPercent: {
        mapValue: (_, row) =>
          row.targetPercent
            ? `${parseFloat(row.targetPercent).toFixed(1)}%${row.maxDeviation ? ` ±${parseFloat(row.maxDeviation).toFixed(0)}%` : ''}`
            : '—',
      },
      drift: {
        mapValue: (_, row) =>
          row.drift !== null
            ? h(
                'span',
                {
                  class: row.isDrifting
                    ? 'text-error font-semibold'
                    : 'text-muted',
                },
                `${row.drift > 0 ? '+' : ''}${row.drift.toFixed(1)}%`
              )
            : h('span', {}, '—'),
      },
    }
  ),
  createActionColumn<PARow>('Akcje', [
    { edit: true, onClick: (entry) => openEditPA(portfolioId, entry) },
    { delete: true, onClick: (entry) => openDeletePA(portfolioId, entry) },
  ]),
]
</script>

<template>
  <div class="mt-4">
    <div
      v-if="props.loading && props.portfolios.length === 0"
      class="flex justify-center py-8"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="animate-spin text-2xl text-muted"
      />
    </div>

    <div
      v-else-if="!props.loading && props.portfolios.length === 0"
      class="text-center text-muted py-8"
    >
      Brak portfeli.
    </div>

    <div v-else class="space-y-4">
      <UCard
        v-for="portfolio in props.portfolios"
        :key="portfolio.id"
        :ui="{
          header: 'min-w-full',
        }"
      >
        <template #header>
          <div
            class="flex flex-col-reverse md:flex-row md:justify-between gap-x-4"
          >
            <div class="flex items-center gap-2">
              <p class="font-semibold truncate">{{ portfolio.name }}</p>
              <UiNotesCell
                v-if="portfolio.description"
                :text="portfolio.description"
                tooltip="Pokaż opis"
              />
            </div>

            <div class="flex gap-1 shrink-0 -mt-2 ml-auto md:mt-0">
              <UTooltip text="Dodaj aktywo">
                <UButton
                  icon="i-lucide-plus"
                  color="primary"
                  variant="ghost"
                  size="sm"
                  @click="openAddPA(portfolio.id)"
                />
              </UTooltip>
              <UTooltip text="Wykres">
                <UButton
                  icon="i-lucide-pie-chart"
                  color="info"
                  variant="ghost"
                  size="sm"
                  @click="openChart(portfolio)"
                />
              </UTooltip>
              <UTooltip text="Edytuj">
                <UButton
                  icon="lucide:pen"
                  color="info"
                  variant="ghost"
                  size="sm"
                  @click="openEditPortfolio(portfolio)"
                />
              </UTooltip>
              <UTooltip text="Usuń">
                <UButton
                  icon="lucide:trash-2"
                  color="error"
                  variant="ghost"
                  size="sm"
                  @click="openDeletePortfolio(portfolio)"
                />
              </UTooltip>
            </div>
          </div>

          <UBadge
            variant="soft"
            color="neutral"
            class="text-sm font-mono -ml-0.5"
          >
            <UiAmount
              :value="portfolio.totalValue"
              :options="{ includeZero: true }"
            />
          </UBadge>
        </template>

        <div
          v-if="portfolio.assets.length === 0"
          class="text-sm text-muted text-center py-4"
        >
          Brak aktywów w tym portfelu.
        </div>
        <UTable
          v-else
          :ref="(el) => setFirstTable(el, portfolios.indexOf(portfolio) === 0)"
          v-model:column-visibility="columnVisibility"
          :data="portfolioEntriesWithColor(portfolio)"
          :columns="makePortfolioAssetColumns(portfolio.id)"
        />
      </UCard>
    </div>

    <!----- MODALS ----->
    <ModalFormPortfolio
      v-model:open="portfolioModal"
      :row="selectedPortfolio"
      @success="onPortfolioSuccess"
    />

    <UiConfirmModal
      v-model:open="deletePortfolioModal"
      :title="`Usuń portfel '${selectedPortfolio?.name ?? ''}'`"
      description="Wszystkie przypisania aktywów zostaną usunięte. Tej operacji nie można cofnąć."
      :loading="deletePortfolioLoading"
      @confirm="handleDeletePortfolio"
    />

    <UModal
      v-model:open="chartModal"
      :title="chartPortfolio?.name ?? ''"
      :description="chartPortfolio?.description ?? undefined"
      size="sm"
    >
      <template v-if="chartPortfolio" #description>
        <span class="font-mono font-semibold text-foreground">
          <UiAmount
            :value="chartPortfolio.totalValue"
            :options="{ includeZero: true }"
          />
        </span>
      </template>
      <template #body>
        <div v-if="chartPortfolio" class="space-y-4">
          <div
            v-if="chartPortfolio.assets.length === 0"
            class="text-center text-muted py-4"
          >
            Brak aktywów w portfelu.
          </div>
          <div v-else class="flex flex-col items-center gap-4">
            <UiDonutChart
              :size="200"
              :segments="portfolioSegments(chartPortfolio)"
            />
            <div class="flex flex-wrap gap-x-3 gap-y-1 justify-center">
              <div
                v-for="seg in portfolioSegments(chartPortfolio)"
                :key="seg.label"
                class="flex items-center gap-1 text-xs"
              >
                <span
                  class="w-2.5 h-2.5 rounded-sm shrink-0"
                  :style="{ background: seg.color }"
                />
                <span>{{ seg.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <ModalFormPortfolioAsset
      v-if="selectedPA"
      v-model:open="paModal"
      :portfolio-id="selectedPA.portfolioId"
      :row="selectedPA.entry"
      :assets="props.assets"
      :portfolios="props.portfolios"
      @success="onPASuccess"
    />

    <UiConfirmModal
      v-model:open="deletePAModal"
      :title="`Usuń '${selectedPA?.entry?.asset.name ?? ''}' z portfela?`"
      description="Aktywo pozostanie na liście aktywów, zostanie tylko usunięte z tego portfela."
      :loading="deletePALoading"
      @confirm="handleDeletePA"
    />
  </div>
</template>
