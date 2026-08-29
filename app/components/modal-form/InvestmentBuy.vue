<script setup lang="ts">
import { investmentBuySchema } from '~/schemas'
import type { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { type CalendarDate, parseDate } from '@internationalized/date'

const { preselectedAssetId, row } = defineProps<{
  preselectedAssetId?: string | null
  row?: AssetPurchase | null
}>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ (e: 'success'): void }>()

const { showError, showSuccess } = useToasts()

type Schema = z.output<typeof investmentBuySchema>

const assetsStore = useAssetsStore()
onMounted(() => assetsStore.fetchAssets())

const selectedAsset = computed(() =>
  assetsStore.assets.find((a) => a.id === state.assetId)
)

const defaultName = computed(() => {
  if (!selectedAsset.value) return ''
  const prefix =
    state.type === TRANSACTION_TYPES.INVESTMENT_SELL ? 'Sprzedaż' : 'Zakup'
  return `${prefix} ${selectedAsset.value.name}`
})

const isEdit = computed(() => !!row)

const setDefaults = (): Partial<Schema> => ({
  assetId: preselectedAssetId ?? undefined,
  accountId: row?.account?.id ?? undefined,
  amount: row?.amount ? Number(row.amount) : undefined,
  quantity: row?.quantity ? Number(row.quantity) : null,
  date: row?.date ? new Date(row.date).toISOString() : '',
  name: row?.name ?? '',
  description: row?.description ?? '',
  type: (row?.type as Schema['type']) ?? TRANSACTION_TYPES.INVESTMENT_BUY,
})

const nameManual = ref(false)
const loading = ref(false)
const state = reactive<Partial<Schema>>(setDefaults())
const date = shallowRef<CalendarDate | undefined>(undefined)
const updateMarketValue = ref(true)
const marketValue = ref<number | undefined>(undefined)

const suggestedMarketValue = computed(() => {
  const asset = selectedAsset.value
  const amount = state.amount ?? 0
  if (!asset || !amount) return undefined
  
  return state.type === TRANSACTION_TYPES.INVESTMENT_BUY
    ? asset.currentValue + amount
    : Math.max(0, asset.currentValue - amount)
})

watch([suggestedMarketValue, () => open.value], () => {
  if (open.value) marketValue.value = suggestedMarketValue.value
})

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) return

    const defaults = setDefaults()
    Object.assign(state, defaults)

    if (defaults.date) {
      const d = defaults.date.split('T')[0]
      date.value = d ? parseDate(d) : undefined
    } else {
      date.value = undefined
    }
  },
  { immediate: true }
)

watch(date, (newDate) => {
  state.date = calendarDateToISO(newDate)
})

watch(
  () => state.assetId,
  () => {
    nameManual.value = false
  }
)

watch(defaultName, (val) => {
  if (!nameManual.value && !isEdit.value) state.name = val
})

const typeItems = [
  { label: 'Zakup', value: TRANSACTION_TYPES.INVESTMENT_BUY },
  { label: 'Sprzedaż', value: TRANSACTION_TYPES.INVESTMENT_SELL },
]

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true
  try {
    const body = {
      ...event.data,
      name: event.data.name || defaultName.value || event.data.type,
    }
    if (isEdit.value && row) {
      await $fetch(`/api/transactions/${row.id}`, { method: 'PUT', body })
      showSuccess('Transakcja została zaktualizowana')
    } else {
      await $fetch('/api/transactions', {
        method: 'POST',
        body: {
          ...body,
          marketValue:
            updateMarketValue.value && marketValue.value
              ? marketValue.value
              : null,
        },
      })
      showSuccess(
        event.data.type === TRANSACTION_TYPES.INVESTMENT_SELL
          ? 'Sprzedaż aktywa została zapisana'
          : 'Zakup aktywa został zapisany'
      )
    }
    emit('success')
  } catch {
    showError(
      isEdit.value
        ? 'Nie udało się zaktualizować transakcji'
        : 'Nie udało się zapisać transakcji'
    )
  } finally {
    await modalCloseAnimation()
    loading.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="
      isEdit ? 'Edytuj transakcję inwestycyjną' : 'Transakcja inwestycyjna'
    "
  >
    <template #body>
      <UForm
        :schema="investmentBuySchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField name="type" label="Typ" required>
          <URadioGroup
            v-model="state.type"
            :items="typeItems"
            :disabled="isEdit"
            orientation="horizontal"
            variant="table"
            class="w-full *:*:w-full *:*:cursor-pointer"
            indicator="hidden"
          />
        </UFormField>

        <UFormField name="assetId" label="Aktywo" required>
          <SelectsAssets
            v-model="state.assetId"
            class="w-full"
            :disabled="isEdit"
          />
        </UFormField>

        <UFormField name="accountId" label="Konto" required>
          <SelectsAccounts v-model="state.accountId" class="w-full" />
        </UFormField>

        <UiInputNumber
          v-model="state.amount"
          :min="0.01"
          :max="VALIDATION.TRANSACTION_AMOUNT_MAX"
          :step="50"
          placeholder="0,00"
          name="amount"
          :label="
            state.type === TRANSACTION_TYPES.INVESTMENT_SELL
              ? 'Kwota (PLN) — środki zwrócone'
              : 'Kwota (PLN) — środki wydane'
          "
          :format-options="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
          required
        />

        <UiInputNumber
          v-model="state.quantity"
          :min="0.000001"
          :max="999999999"
          :step="1"
          placeholder="np. 10 (opcjonalnie)"
          name="quantity"
          label="Ilość / Liczba jednostek (opcjonalnie)"
          :format-options="{ maximumFractionDigits: 6 }"
          :required="false"
        />

        <UFormField name="date" label="Data" required>
          <UiInputDate v-model="date" :range="false" class="w-full" />
        </UFormField>

        <UiInput
          v-model="state.name"
          name="name"
          label="Nazwa"
          :placeholder="defaultName || 'Nazwa transakcji'"
          @input="nameManual = true"
        />

        <div
          v-if="!isEdit"
          class="rounded-lg border border-default p-3 space-y-3"
        >
          <UCheckbox
            v-model="updateMarketValue"
            label="Zaktualizuj wartość rynkową"
          />
          <template v-if="updateMarketValue">
            <p v-if="selectedAsset" class="text-xs text-muted">
              Aktualna:
              <span class="font-mono font-medium text-foreground">
                {{ formatCurrency(selectedAsset.currentValue) }}
              </span>
            </p>
            <UiInputNumber
              v-model="marketValue"
              :min="0.01"
              :max="VALIDATION.TRANSACTION_AMOUNT_MAX"
              :step="100"
              placeholder="0,00"
              label="Nowa wartość rynkowa (PLN)"
              :format-options="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
              :required="false"
            />
          </template>
        </div>

        <UiTextarea
          v-model="state.description"
          name="description"
          label="Opis (opcjonalnie)"
          placeholder="Notatka..."
          :required="false"
          :rows="2"
        />

        <UiModalButtons
          :label="
            isEdit
              ? 'Zapisz'
              : state.type === TRANSACTION_TYPES.INVESTMENT_SELL
                ? 'Zapisz sprzedaż'
                : 'Zapisz zakup'
          "
          :loading="loading"
          type="primary"
          @cancel="open = false"
        />
      </UForm>
    </template>
  </UModal>
</template>
