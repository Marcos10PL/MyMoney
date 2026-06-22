<script setup lang="ts">
import { categorySchema } from '~/schemas'
import type { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { row } = defineProps<{
  row: Category | null
}>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  (e: 'success'): void
}>()

const store = useCategoriesStore()
const { showError, showSuccess } = useToasts()

type Schema = z.output<typeof categorySchema>
const setDefaults = (): Schema => ({
  name: row?.name ?? '',
  type: row?.type ?? CATEGORY_TYPES.EXPENSE!,
})

const state = reactive<Schema>(setDefaults())
const loading = ref(false)

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) return
    Object.assign(state, setDefaults())
  },
  { immediate: true }
)

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true
  try {
    if (row) {
      await store.updateCategory(row.id, event.data)
      showSuccess('Kategoria została zaktualizowana')
    } else {
      await store.createCategory(event.data)
      showSuccess('Kategoria została dodana')
    }
    emit('success')
  } catch (e) {
    const statusCode = returnErrorStatus(e)
    if (statusCode === 409) {
      showError('Kategoria o takiej nazwie już istnieje')
    } else {
      showError(
        row
          ? 'Nie udało się zaktualizować kategorii'
          : 'Nie udało się dodać kategorii'
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
    :title="row ? 'Edytuj kategorię' : 'Dodaj kategorię'"
  >
    <template #body>
      <UForm
        :schema="categorySchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UiInput
          v-model="state.name"
          name="name"
          label="Nazwa"
          placeholder="Nazwa kategorii"
          autofocus
        />

        <UFormField name="type" label="Typ" required>
          <SelectsCategoryTypes v-model="state.type" class="w-full" />
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
