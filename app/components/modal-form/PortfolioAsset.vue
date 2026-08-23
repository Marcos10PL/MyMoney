<script setup lang="ts">
import { portfolioAssetSchema } from '~/schemas'
import type { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { portfolioId, row, assets, portfolios } = defineProps<{
  portfolioId: string
  row: PortfolioAssetEntry | null
  assets: Asset[]
  portfolios: Portfolio[]
}>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ (e: 'success'): void }>()

const { showError, showSuccess } = useToasts()

type Schema = z.output<typeof portfolioAssetSchema>

const setDefaults = (): Schema => ({
  assetId: row?.asset.id ?? '',
  allocatedAmount:
    row?.allocatedAmount != null ? parseFloat(row.allocatedAmount) : null,
  allocationMode: row?.allocationMode ?? ALLOCATION_MODES.VALUE,
  targetPercent:
    row?.targetPercent != null ? parseFloat(row.targetPercent) : null,
  maxDeviation: row?.maxDeviation != null ? parseFloat(row.maxDeviation) : null,
  gainWeight: row?.gainWeight != null ? parseFloat(row.gainWeight) : null,
})

const state = reactive<Schema>(setDefaults())
watch(open, () => Object.assign(state, setDefaults()), { immediate: true })

const isCostMode = computed(
  () => state.allocationMode === ALLOCATION_MODES.COST
)

const selectedAsset = computed(() => assets.find((a) => a.id === state.assetId))
const assetCurrentValue = computed(() => selectedAsset.value?.currentValue ?? 0)
const assetCostBasis = computed(() => selectedAsset.value?.costBasis ?? 0)
const costModeDisabled = computed(() => assetCostBasis.value <= 0)

const allocatedElsewhereValue = computed(() => {
  if (!state.assetId) return 0
  let sum = 0
  for (const p of portfolios) {
    for (const e of p.assets) {
      if (e.asset.id !== state.assetId) continue
      if (row && e.id === row.id) continue
      sum += e.effectiveValue
    }
  }
  return sum
})

const allocatedElsewhereCost = computed(() => {
  if (assetCurrentValue.value <= 0) return 0
  return (
    (allocatedElsewhereValue.value / assetCurrentValue.value) *
    assetCostBasis.value
  )
})

const basisTotal = computed(() =>
  isCostMode.value ? assetCostBasis.value : assetCurrentValue.value
)
const allocatedElsewhere = computed(() =>
  isCostMode.value
    ? allocatedElsewhereCost.value
    : allocatedElsewhereValue.value
)

const freeToAllocate = computed(() =>
  Math.max(0, basisTotal.value - allocatedElsewhere.value)
)

const currentEntryAmount = computed(() => {
  if (!row || row.allocationMode !== state.allocationMode) return 0
  return row.allocatedAmount != null ? parseFloat(row.allocatedAmount) : 0
})
const inputMax = computed(() =>
  Math.max(freeToAllocate.value, currentEntryAmount.value)
)

const displayFree = computed(() => {
  if (state.allocatedAmount != null) {
    return Math.max(0, freeToAllocate.value - state.allocatedAmount)
  }
  if (row) return 0
  return freeToAllocate.value
})

const liveOverAllocatedBy = computed(() => {
  if (state.allocatedAmount == null) return null
  const overage =
    allocatedElsewhere.value + state.allocatedAmount - basisTotal.value
  return overage > 0.005 ? overage : null
})

const onAllocationModeChange = (mode: Schema['allocationMode']) => {
  if (mode === state.allocationMode) return
  state.allocationMode = mode
  state.allocatedAmount = null
}

const loading = ref(false)

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true
  try {
    if (row) {
      await $fetch(
        `/api/investments/portfolios/${portfolioId}/assets/${row.id}`,
        {
          method: 'PUT',
          body: {
            allocatedAmount: event.data.allocatedAmount ?? null,
            allocationMode: event.data.allocationMode,
            targetPercent: event.data.targetPercent ?? null,
            maxDeviation: event.data.maxDeviation ?? null,
            gainWeight: event.data.gainWeight ?? null,
          },
        }
      )
      showSuccess('Aktywo zostało zaktualizowane')
    } else {
      await $fetch(`/api/investments/portfolios/${portfolioId}/assets`, {
        method: 'POST',
        body: event.data,
      })
      showSuccess('Aktywo zostało dodane do portfela')
    }
    emit('success')
  } catch (e) {
    const status = returnErrorStatus(e)
    if (status === 409) {
      showError('To aktywo jest już w tym portfelu')
    } else if (status === 422) {
      const msg = (e as { data?: { message?: string } })?.data?.message ?? ''
      if (msg.includes('gain weight')) {
        showError('Suma udziałów w zysku przekracza 100%')
      } else {
        showError('Suma alokacji przekracza wartość aktywa')
      }
    } else {
      showError('Nie udało się zapisać')
    }
  } finally {
    await modalCloseAnimation()
    loading.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="row ? 'Edytuj aktywo w portfelu' : 'Dodaj aktywo do portfela'"
  >
    <template #body>
      <UForm
        :schema="portfolioAssetSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField name="assetId" label="Aktywo" required>
          <UiSelect
            v-model="state.assetId"
            :items="assets.map((a) => ({ value: a.id, label: a.name }))"
            placeholder="Wybierz aktywo..."
            :disabled="row != null"
            class="w-full"
          />
        </UFormField>

        <UFormField
          v-if="state.assetId"
          name="allocationMode"
          label="Podział wg"
        >
          <URadioGroup
            :model-value="state.allocationMode"
            :items="[
              { label: 'Wartości bieżącej', value: ALLOCATION_MODES.VALUE },
              {
                label: 'Kosztu nabycia',
                value: ALLOCATION_MODES.COST,
                disabled: costModeDisabled,
              },
            ]"
            orientation="horizontal"
            variant="table"
            class="w-full *:*:w-full *:*:cursor-pointer"
            indicator="hidden"
            @update:model-value="onAllocationModeChange"
          />
          <p v-if="costModeDisabled" class="text-xs text-muted mt-1">
            Podział wg kosztu wymaga transakcji zakupu tego aktywa.
          </p>
        </UFormField>

        <p
          v-if="state.assetId && basisTotal > 0"
          class="text-xs flex flex-col gap-0.5 text-muted -mt-2"
        >
          <span>
            {{ isCostMode ? 'Koszt nabycia aktywa' : 'Wartość aktywa' }}:
            <span class="font-mono font-semibold pl-1">
              {{ formatCurrency(basisTotal, { includeZero: true }) }}
            </span>
          </span>
          <span>
            Przydzielona w innych portfelach:
            <span class="font-mono font-semibold pl-1">
              {{ formatCurrency(allocatedElsewhere, { includeZero: true }) }}
            </span>
          </span>
          <template v-if="row">
            <span>
              Przydzielono w tej pozycji:
              <span class="font-mono font-semibold pl-1">
                {{
                  row.allocatedAmount != null
                    ? formatCurrency(parseFloat(row.allocatedAmount), {
                        includeZero: true,
                      })
                    : 'cała pozostała kwota'
                }}
              </span>
            </span>
            <span>
              Maks. do przydzielenia w tej pozycji:
              <span class="font-mono font-semibold pl-1">
                {{ formatCurrency(freeToAllocate, { includeZero: true }) }}
              </span>
            </span>
          </template>
          <template v-else>
            <span>
              Nieprzydzielona kwota:
              <span class="font-mono font-semibold pl-1">
                {{ formatCurrency(displayFree, { includeZero: true }) }}
              </span>
            </span>
          </template>
        </p>

        <UAlert
          v-if="liveOverAllocatedBy != null"
          variant="subtle"
          color="error"
        >
          <template #description>
            Ta pozycja razem z innymi przekracza dostępną
            {{ isCostMode ? 'wartość kosztu' : 'wartość' }} aktywa o
            {{ formatCurrency(liveOverAllocatedBy) }}. Zmniejsz kwotę albo
            popraw inne pozycje tego aktywa.
          </template>
        </UAlert>

        <UiInputNumber
          v-model="state.allocatedAmount"
          name="allocatedAmount"
          :label="
            isCostMode
              ? 'Przydzielony koszt nabycia'
              : 'Przydzielona kwota (opcjonalnie)'
          "
          :required="isCostMode"
          :min="0"
          :format-options="{ maximumFractionDigits: 2 }"
          :placeholder="
            isCostMode ? 'np. 20000' : 'puste = cała nieprzydzielona kwota'
          "
          :max="inputMax"
        />

        <div class="grid grid-cols-2 gap-3">
          <UiInputNumber
            v-model="state.targetPercent"
            name="targetPercent"
            label="Cel % (opcjonalnie)"
            :required="false"
            :min="0"
            :max="100"
            :format-options="{ maximumFractionDigits: 2 }"
            placeholder="np. 40"
          />
          <UiInputNumber
            v-model="state.maxDeviation"
            name="maxDeviation"
            label="Maks. odchylenie (pp, opcjonalnie)"
            :required="false"
            :min="0"
            :max="100"
            :format-options="{ maximumFractionDigits: 2 }"
            placeholder="np. 3"
          />
        </div>

        <UiInputNumber
          v-model="state.gainWeight"
          name="gainWeight"
          label="Udział w zysku % (opcjonalnie)"
          :required="false"
          :min="0"
          :max="100"
          :format-options="{ maximumFractionDigits: 2 }"
          placeholder="puste = proporcjonalnie do wartości"
        />

        <UiModalButtons
          :label="row ? 'Zapisz' : 'Dodaj'"
          :loading="loading"
          type="primary"
          @cancel="open = false"
        />
      </UForm>
    </template>
  </UModal>
</template>
