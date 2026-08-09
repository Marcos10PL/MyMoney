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
  targetPercent:
    row?.targetPercent != null ? parseFloat(row.targetPercent) : null,
  maxDeviation: row?.maxDeviation != null ? parseFloat(row.maxDeviation) : null,
  gainWeight: row?.gainWeight != null ? parseFloat(row.gainWeight) : null,
})

const state = reactive<Schema>(setDefaults())
watch(open, () => Object.assign(state, setDefaults()), { immediate: true })

const allocatedElsewhere = computed(() => {
  if (!state.assetId) return 0

  let explicit = 0
  let hasNullOther = false
  for (const p of portfolios) {
    for (const e of p.assets) {
      if (e.asset.id !== state.assetId) continue
      if (row && e.id === row.id) continue
      if (e.allocatedAmount != null) {
        explicit += parseFloat(e.allocatedAmount)
      } else {
        hasNullOther = true
      }
    }
  }

  if (!hasNullOther) return explicit

  const selfStored =
    row?.allocatedAmount != null ? parseFloat(row.allocatedAmount) : 0
  const nullEffective = Math.max(
    0,
    assetCurrentValue.value - explicit - selfStored
  )
  return explicit + nullEffective
})

const assetCurrentValue = computed(
  () => assets.find((a) => a.id === state.assetId)?.currentValue ?? 0
)

const freeToAllocate = computed(() =>
  Math.max(0, assetCurrentValue.value - allocatedElsewhere.value)
)

const displayFree = computed(() => {
  if (state.allocatedAmount != null) {
    return Math.max(0, freeToAllocate.value - state.allocatedAmount)
  }
  if (row) return 0
  return freeToAllocate.value
})

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

        <p
          v-if="state.assetId && assetCurrentValue > 0"
          class="text-xs flex flex-col gap-0.5 text-muted -mt-2"
        >
          <span>
            Wartość aktywa:
            <span class="font-mono font-semibold pl-1">
              {{ formatCurrency(assetCurrentValue, { includeZero: true }) }}
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

        <UiInputNumber
          v-model="state.allocatedAmount"
          name="allocatedAmount"
          label="Przydzielona kwota (opcjonalnie)"
          :required="false"
          :min="0"
          :format-options="{ maximumFractionDigits: 2 }"
          placeholder="puste = cała nieprzydzielona kwota"
          :max="freeToAllocate"
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
            label="Maks. odchylenie % (opcjonalnie)"
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
