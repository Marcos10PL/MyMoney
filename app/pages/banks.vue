<script setup lang="ts">
import type z from 'zod'

import { bankSchema } from '~/schemas'

const store = useBanksStore()
const { showError, showSuccess } = useToasts()

const search = ref('')
const modalOpen = ref(false)
const deleteModalOpen = ref(false)
const formLoading = ref(false)
const bankValue = ref<AppBank | null>(null)

type Schema = z.output<typeof bankSchema>
const formState = reactive<Schema>({ name: '' })

const filteredBanks = computed(() =>
  store.banks.filter((b) =>
    b.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

const columns = createColumns<AppBank>(['name'], {
  name: { isSortable: true },
})

const actionColumn = createActionColumn<AppBank>('Akcje', [
  {
    edit: true,
    onClick: (bank) => {
      bankValue.value = bank
      formState.name = bank.name
      modalOpen.value = true
    },
  },
  {
    delete: true,
    onClick: (bank) => {
      bankValue.value = bank
      deleteModalOpen.value = true
    },
  },
])

const openCreateModal = () => {
  bankValue.value = null
  formState.name = ''
  modalOpen.value = true
}

const reset = async () => {
  modalOpen.value = false
  deleteModalOpen.value = false
  bankValue.value = null
  formState.name = ''
}

const onSubmit = async () => {
  if (!formState.name.trim()) return
  formLoading.value = true
  try {
    if (bankValue.value) {
      await store.updateBank(bankValue.value.id, formState.name)
      showSuccess('Bank został zaktualizowany')
    } else {
      await store.createBank(formState.name)
      showSuccess('Bank został dodany')
    }
    await reset()
  } catch (e) {
    const statusCode = returnErrorStatus(e)
    if (statusCode === 409) {
      showError('Bank o takiej nazwie już istnieje')
    } else {
      showError(
        bankValue.value
          ? 'Nie udało się zaktualizować banku'
          : 'Nie udało się dodać banku'
      )
    }
  } finally {
    await new Promise((resolve) => setTimeout(resolve, 170)) // wait for modal close animation
    formLoading.value = false
  }
}

const handleDelete = async () => {
  if (!bankValue.value) return
  formLoading.value = true
  try {
    await store.deleteBank(bankValue.value.id)
    showSuccess('Bank został usunięty')
    await reset()
  } catch {
    showError('Nie udało się usunąć banku')
  } finally {
    await new Promise((resolve) => setTimeout(resolve, 170)) // wait for modal close animation
    formLoading.value = false
  }
}

onMounted(() => store.fetchBanks())
</script>

<template>
  <div>
    <SubHeader
      title="Banki"
      create-button
      create-label="Dodaj bank"
      :refresh-loading="store.loading"
      @create="openCreateModal"
      @refresh="store.fetchBanks"
    />

    <div class="mb-4">
      <UInput
        v-model="search"
        placeholder="Szukaj po nazwie..."
        icon="i-lucide-search"
        class="max-w-xs"
      />
    </div>

    <UTable
      ref="table"
      :data="filteredBanks"
      :columns="[...columns, actionColumn]"
      :loading="store.loading"
      :empty="store.loading ? 'Ładowanie...' : 'Brak banków do wyświetlenia'"
    />

    <UModal
      v-model:open="modalOpen"
      :title="bankValue ? 'Edytuj bank' : 'Dodaj bank'"
    >
      <template #body>
        <UForm :schema="bankSchema" :state="formState" class="space-y-4">
          <UiInput
            v-model="formState.name"
            name="name"
            label="Nazwa"
            placeholder="Nazwa banku"
            autofocus
          />
          <UiModalButtons
            :label="bankValue ? 'Zapisz' : 'Dodaj'"
            :loading="store.loading || formLoading"
            type="primary"
            @confirm="onSubmit"
            @cancel="reset"
          />
        </UForm>
      </template>
    </UModal>

    <UiConfirmModal
      v-model:open="deleteModalOpen"
      :title="`Usuń bank '${bankValue?.name ?? ''}'.`"
      description="Czy na pewno chcesz usunąć ten bank? Tej operacji nie można cofnąć."
      :loading="formLoading"
      @confirm="handleDelete"
    />
  </div>
</template>
