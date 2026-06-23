<script setup lang="ts">
import { accountSchema } from '~/schemas'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import { parseDate } from '@internationalized/date'

const { row } = defineProps<{
  row: Account | null
}>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  (e: 'success'): void
}>()

const store = useAccountsStore()
const { showError, showSuccess } = useToasts()

type FormState = z.input<typeof accountSchema>

const setDefaults = (): FormState => ({
  bankId: row?.bank?.id ?? undefined,
  name: row?.name ?? '',
  description: row?.description ?? '',
  type: row?.type ?? ACCOUNT_TYPES.CHECKING,
  percentage: row?.percentage != null ? Number(row.percentage) : undefined,
  isFree: row?.isFree ?? true,
  isActive: row?.isActive ?? true,
  conditions: row?.conditions ?? '',
  duration: row?.duration ?? ACCOUNT_DURATION.INDEFINITE,
  durationEndDate: row?.durationEndDate ? row.durationEndDate.toString() : '',
  startDate: row?.startDate ? row.startDate.toString() : '',
})

const state = reactive<FormState>(setDefaults())
const loading = ref(false)

const durationEndDateModel = shallowRef(
  state.durationEndDate ? parseDate(state.durationEndDate) : undefined
)
const startDateModel = shallowRef(
  state.startDate ? parseDate(state.startDate) : undefined
)

watch(
  [startDateModel, durationEndDateModel],
  (newDates) => {
    const [newStartDate, newDurationEndDate] = newDates

    state.startDate = calendarDateToISO(newStartDate)
    state.durationEndDate = calendarDateToISO(newDurationEndDate) || undefined
  },
  { immediate: true }
)

watch(
  open,
  (isOpen) => {
    if (!isOpen) return

    const defaults = setDefaults()
    Object.assign(state, defaults)

    startDateModel.value = defaults.startDate
      ? parseDate(defaults.startDate.split('T')[0]!)
      : undefined
    durationEndDateModel.value = defaults.durationEndDate
      ? parseDate(defaults.durationEndDate.split('T')[0]!)
      : undefined
  },
  { immediate: true }
)

const onSubmit = async (
  event: FormSubmitEvent<z.output<typeof accountSchema>>
) => {
  loading.value = true
  try {
    if (row) {
      await store.updateAccount(row.id, event.data)
      showSuccess('Konto zostało zaktualizowane')
    } else {
      await store.createAccount(event.data)
      showSuccess('Konto zostało dodane')
    }
    emit('success')
  } catch {
    showError(
      row ? 'Nie udało się zaktualizować konta' : 'Nie udało się dodać konta'
    )
  } finally {
    await modalCloseAnimation()
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" :title="row ? 'Edytuj konto' : 'Dodaj konto'">
    <template #body>
      <UForm
        :schema="accountSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UiInput
          v-model="state.name"
          name="name"
          label="Nazwa"
          placeholder="Nazwa konta"
          autofocus
        />

        <UFormField name="type" label="Typ" required>
          <SelectsAccountTypes v-model="state.type" class="w-full" />
        </UFormField>

        <UiTextarea
          v-model="state.description"
          name="description"
          label="Opis"
          placeholder="Opis konta..."
          :required="false"
          :rows="3"
        />

        <UFormField name="bankId" label="Bank">
          <SelectsBanks v-model="state.bankId" clearable class="w-full" />
        </UFormField>

        <div class="flex items-center gap-2">
          <UiInputNumber
            v-model="state.percentage"
            name="percentage"
            label="Procent (zostaw puste jeśli nie dotyczy)"
            placeholder="0,00"
            :required="false"
            :step="0.01"
            :min="0"
            :max="100"
          />
        </div>

        <UFormField name="startDate" label="Data rozpoczęcia" required>
          <UiInputDate v-model="startDateModel" :range="false" class="w-full" />
        </UFormField>

        <UFormField name="duration" label="Czas trwania" required>
          <SelectsAccountDurationTypes
            v-model="state.duration"
            class="w-full"
          />
        </UFormField>

        <UFormField
          v-if="state.duration === ACCOUNT_DURATION.FIXED"
          name="durationEndDate"
          label="Data zakończenia"
          required
        >
          <UiInputDate
            v-model="durationEndDateModel"
            :range="false"
            :with-max="false"
            class="w-full"
          />
        </UFormField>

        <UiTextarea
          v-model="state.conditions"
          name="conditions"
          label="Warunki"
          placeholder="Warunki konta..."
          :required="false"
          :rows="3"
        />

        <USwitch v-model="state.isFree" name="isFree" label="Czy darmowe?" />
        <USwitch
          v-model="state.isActive"
          name="isActive"
          label="Czy aktywne?"
        />

        <UiModalButtons
          :label="row ? 'Zapisz' : 'Dodaj'"
          :loading="store.loading || loading"
          type="primary"
          @cancel="open = false"
        />
      </UForm>
    </template>
  </UModal>
</template>
