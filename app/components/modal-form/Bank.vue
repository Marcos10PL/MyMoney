<script setup lang="ts">
import { bankSchema } from '~/schemas'
import type { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { row } = defineProps<{
  row: AppBank | null
}>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  (e: 'success'): void
}>()

const store = useBanksStore()
const { showError, showSuccess } = useToasts()

type Schema = z.output<typeof bankSchema>
const setDefaults = (): Schema => ({
  name: row?.name ?? '',
})
const state = reactive<Schema>(setDefaults())

watch(
  open,
  () => {
    Object.assign(state, setDefaults())
  },
  { immediate: true }
)

const loading = ref(false)

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true
  try {
    if (row) {
      await store.updateBank(row.id, event.data)
      showSuccess('Instytucja finansowa została zaktualizowana')
    } else {
      await store.createBank(event.data)
      showSuccess('Instytucja finansowa została dodana')
    }
    emit('success')
  } catch (e) {
    const statusCode = returnErrorStatus(e)
    if (statusCode === 409) {
      showError('Instytucja finansowa o takiej nazwie już istnieje')
    } else {
      showError(
        row
          ? 'Nie udało się zaktualizować instytucji finansowej'
          : 'Nie udało się dodać instytucji finansowej'
      )
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
    :title="row ? 'Edytuj instytucję finansową' : 'Dodaj instytucję finansową'"
  >
    <template #body>
      <UForm
        :schema="bankSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UiInput
          v-model="state.name"
          name="name"
          label="Nazwa"
          placeholder="Nazwa instytucji finansowej"
          autofocus
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
