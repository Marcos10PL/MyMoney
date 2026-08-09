<script setup lang="ts">
import { portfolioSchema } from '~/schemas'
import type { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { row } = defineProps<{
  row: Portfolio | null
}>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ (e: 'success'): void }>()

const { showError, showSuccess } = useToasts()

type Schema = z.output<typeof portfolioSchema>

const setDefaults = (): Schema => ({
  name: row?.name ?? '',
  description: row?.description ?? '',
})

const state = reactive<Schema>(setDefaults())
watch(open, () => Object.assign(state, setDefaults()), { immediate: true })

const loading = ref(false)

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true
  try {
    if (row) {
      await $fetch<APIResponse<Portfolio>>(
        `/api/investments/portfolios/${row.id}`,
        {
          method: 'PUT',
          body: event.data,
        }
      )
      showSuccess('Portfel został zaktualizowany')
    } else {
      await $fetch<APIResponse<Portfolio>>('/api/investments/portfolios', {
        method: 'POST',
        body: event.data,
      })
      showSuccess('Portfel został dodany')
    }
    emit('success')
  } catch {
    showError(
      row
        ? 'Nie udało się zaktualizować portfela'
        : 'Nie udało się dodać portfela'
    )
  } finally {
    await modalCloseAnimation()
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" :title="row ? 'Edytuj portfel' : 'Dodaj portfel'">
    <template #body>
      <UForm
        :schema="portfolioSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UiInput
          v-model="state.name"
          name="name"
          label="Nazwa"
          placeholder="np. Poduszka finansowa"
          autofocus
        />
        <UiInput
          v-model="state.description"
          name="description"
          label="Opis (opcjonalnie)"
          placeholder="Krótki opis celu portfela..."
          :required="false"
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
