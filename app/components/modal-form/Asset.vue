<script setup lang="ts">
import { assetSchema } from '~/schemas'
import type { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { row } = defineProps<{
  row: Asset | null
}>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ (e: 'success'): void }>()

const { showError, showSuccess } = useToasts()

type Schema = z.output<typeof assetSchema>

const setDefaults = (): Schema => ({
  accountIds: row?.accounts.map((a) => a.id) ?? [],
  name: row?.name ?? '',
  type: row?.type ?? ASSET_TYPES.OTHER,
  value: row?.accounts.length ? 0 : parseFloat(row?.value ?? '0') || 0,
  currency: row?.currency ?? 'PLN',
  description: row?.description ?? '',
})

const state = reactive<Schema>(setDefaults())
watch(open, () => Object.assign(state, setDefaults()), { immediate: true })

const accountsStore = useAccountsStore()

const linkedAccounts = computed(() => state.accountIds.length > 0)

const selectedTotal = computed(() => {
  if (!linkedAccounts.value) return 0
  return state.accountIds.reduce((sum, id) => {
    const acc = accountsStore.accounts.find((a) => a.id === id)
    return sum + (acc?.balance ?? 0)
  }, 0)
})

const loading = ref(false)

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true
  try {
    if (row) {
      await $fetch<APIResponse<Asset>>(`/api/investments/assets/${row.id}`, {
        method: 'PUT',
        body: event.data,
      })
      showSuccess('Aktywo zostało zaktualizowane')
    } else {
      await $fetch<APIResponse<Asset>>('/api/investments/assets', {
        method: 'POST',
        body: event.data,
      })
      showSuccess('Aktywo zostało dodane')
    }
    emit('success')
  } catch {
    showError(
      row ? 'Nie udało się zaktualizować aktywa' : 'Nie udało się dodać aktywa'
    )
  } finally {
    await modalCloseAnimation()
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" :title="row ? 'Edytuj aktywo' : 'Dodaj aktywo'">
    <template #body>
      <UForm
        :schema="assetSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UiInput
          v-model="state.name"
          name="name"
          label="Nazwa"
          placeholder="np. Obligacje"
          autofocus
        />

        <UFormField name="type" label="Typ aktywa" required>
          <SelectsAssetTypes v-model="state.type" class="w-full" />
        </UFormField>

        <UFormField name="accountIds" label="Powiązane konta (opcjonalnie)">
          <SelectsAccounts
            v-model="state.accountIds"
            multiple
            clearable
            class="w-full"
          />
        </UFormField>

        <UiInputNumber
          v-if="!linkedAccounts"
          v-model="state.value"
          name="value"
          label="Wartość"
          :min="0"
          :max="VALIDATION.TRANSACTION_AMOUNT_MAX"
          :step="0.01"
          :format-options="{ maximumFractionDigits: 2 }"
        />

        <p v-else class="text-sm text-muted -mt-2">
          Wartość łączna powiązanych kont:
          <span class="font-mono font-semibold text-foreground pl-1.5">
            <UiAmount :value="selectedTotal" :options="{ includeZero: true }" />
          </span>
        </p>

        <UiInput
          v-model="state.description"
          name="description"
          label="Opis (opcjonalnie)"
          placeholder="Krótki opis..."
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
