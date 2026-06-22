<script setup lang="ts">
import { transactionSchema } from '~/schemas'
import type { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { parseDate } from '@internationalized/date'

const { row } = defineProps<{
  row: Transaction | null
}>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  (e: 'success'): void
}>()

const { showError, showSuccess } = useToasts()

type Schema = z.output<typeof transactionSchema>
const setDefaults = (): Partial<Schema> => ({
  name: row?.name ?? '',
  accountId: row?.account?.id ?? undefined,
  categoryId: row?.category?.id ?? undefined,

  toAccountId: row?.toAccount?.id ?? undefined,
  counterparty: row?.counterparty ?? '',

  type: row?.type ?? TRANSACTION_TYPES.EXPENSE!,
  amount: row?.amount ? Number(row.amount) : undefined,
  description: row?.description ?? '',
  date: row?.date ? row.date.toString() : '',
})

const loading = ref(false)
const state = reactive<Partial<Schema>>(setDefaults())

const date = shallowRef(state.date ? parseDate(state.date) : undefined)

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) return

    const defaults = setDefaults()
    Object.assign(state, defaults)

    date.value = defaults.date
      ? parseDate(defaults.date.split('T')[0]!)
      : undefined
  },
  { immediate: true }
)

watch(
  date,
  (newDate) => {
    state.date = calendarDateToISO(newDate)
  },
  { immediate: true }
)

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true
  try {
    if (row) {
      await $fetch(`/api/transactions/${row.id}`, {
        method: 'PUT',
        body: event.data,
      })
      showSuccess('Transakcja została zaktualizowana')
    } else {
      await $fetch('/api/transactions', {
        method: 'POST',
        body: event.data,
      })
      showSuccess('Transakcja została dodana')
    }
    emit('success')
  } catch {
    showError(
      row
        ? 'Nie udało się zaktualizować transakcji'
        : 'Nie udało się dodać transakcji'
    )
  } finally {
    await modalCloseAnimation()
    loading.value = false
  }
}

const isEdit = computed(() => !!row)

const isTransferAndEdit = computed(
  () => state.type === TRANSACTION_TYPES.TRANSFER && isEdit.value
)

const mapTransactionTypeToCategoryType = (
  transactionType?: Transaction['type']
): Category['type'] | undefined => {
  switch (transactionType) {
    case TRANSACTION_TYPES.EXPENSE:
      return CATEGORY_TYPES.EXPENSE
    case TRANSACTION_TYPES.INCOME:
      return CATEGORY_TYPES.INCOME
    default:
      return undefined
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="row ? 'Edytuj transakcję' : 'Dodaj transakcję'"
  >
    <template #body>
      <UForm
        :schema="transactionSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UiInput
          v-model="state.name"
          name="name"
          label="Nazwa"
          placeholder="Nazwa transakcji"
          autofocus
        />

        <UFormField name="accountId" label="Konto" required>
          <SelectsAccounts
            v-model="state.accountId"
            class="w-full"
            :disabled="isTransferAndEdit"
          />
        </UFormField>

        <UiInputNumber
          v-model="state.amount"
          :min="0.01"
          :max="VALIDATION.TRANSACTION_AMOUNT_MAX"
          :step="50"
          placeholder="0,00"
          name="amount"
          label="Kwota (PLN)"
          :disabled="isTransferAndEdit"
        />

        <UiTextarea
          v-model="state.description"
          name="description"
          label="Opis"
          placeholder="Opis transakcji"
          :required="false"
          :rows="3"
        />

        <UFormField name="type" label="Typ" required>
          <SelectsTransactionTypes
            v-model="state.type"
            class="w-full"
            :disabled="isTransferAndEdit"
            :exclude="isEdit ? [TRANSACTION_TYPES.TRANSFER] : undefined"
          />
        </UFormField>

        <UFormField
          v-if="mapTransactionTypeToCategoryType(state.type)"
          name="categoryId"
          label="Kategoria"
        >
          <SelectsCategories
            v-model="state.categoryId"
            :type="mapTransactionTypeToCategoryType(state.type)"
            class="w-full"
            clearable
          />
        </UFormField>

        <UiInput
          v-if="
            state.type === TRANSACTION_TYPES.LOAN_RECEIVED ||
            state.type === TRANSACTION_TYPES.LOAN_GIVEN
          "
          v-model="state.counterparty"
          name="counterparty"
          label="Kontrahent"
          placeholder="Nazwa kontrahenta"
          :required="true"
        />

        <UFormField
          v-if="
            state.type === TRANSACTION_TYPES.TRANSFER ||
            (isTransferAndEdit && row?.toAccount?.id)
          "
          name="toAccountId"
          label="Konto"
          required
        >
          <SelectsAccounts
            v-model="state.toAccountId"
            :disabled="isTransferAndEdit"
            class="w-full"
          />
        </UFormField>

        <UFormField name="date" label="Data" required>
          <UiInputDate
            v-model="date"
            :disabled="isTransferAndEdit"
            :range="false"
            class="w-full"
          />
        </UFormField>

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
