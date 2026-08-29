<script setup lang="ts">
import { assetSnapshotSchema } from '~/schemas'
import type { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { type CalendarDate, parseDate } from '@internationalized/date'

const { assetId, row = null } = defineProps<{
  assetId: string
  row?: AssetSnapshot | null
}>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ success: [] }>()

const { showError, showSuccess } = useToasts()

type Schema = z.output<typeof assetSnapshotSchema>

const todayISO = () => new Date().toISOString().split('T')[0]!

const state = reactive<Partial<Schema>>({ value: undefined, date: todayISO() })
const date = shallowRef<CalendarDate | undefined>(parseDate(todayISO()))

watch(open, (isOpen) => {
  if (!isOpen) return
  if (row) {
    state.value = row.value
    state.date = row.date
    date.value = parseDate(row.date)
  } else {
    const today = todayISO()
    state.value = undefined
    state.date = today
    date.value = parseDate(today)
  }
})

watch(date, (d) => {
  state.date = d ? d.toString() : (row?.date ?? todayISO())
})

const loading = ref(false)

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true
  try {
    if (row) {
      await $fetch(`/api/investments/assets/${assetId}/snapshots/${row.id}`, {
        method: 'PATCH',
        body: event.data,
      })
      showSuccess('Pomiar został zaktualizowany')
    } else {
      await $fetch(`/api/investments/assets/${assetId}/snapshots`, {
        method: 'POST' as never,
        body: event.data,
      })
      showSuccess('Pomiar został zapisany')
    }
    emit('success')
  } catch {
    showError(
      row
        ? 'Nie udało się zaktualizować pomiaru'
        : 'Nie udało się zapisać pomiaru'
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
    :title="row ? 'Edytuj pomiar' : 'Nowy pomiar wartości rynkowej'"
  >
    <template #body>
      <UForm
        :schema="assetSnapshotSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UiInputNumber
          v-model="state.value"
          name="value"
          label="Wartość rynkowa (PLN)"
          :min="0.01"
          :max="VALIDATION.TRANSACTION_AMOUNT_MAX"
          :step="100"
          placeholder="0,00"
          :format-options="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
          required
        />
        <UFormField name="date" label="Data pomiaru">
          <UiInputDate v-model="date" :range="false" class="w-full" />
        </UFormField>
        <UiModalButtons
          label="Zapisz"
          :loading="loading"
          type="primary"
          @cancel="open = false"
        />
      </UForm>
    </template>
  </UModal>
</template>
