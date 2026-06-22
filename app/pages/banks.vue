<script setup lang="ts">
const store = useBanksStore()
const { showError, showSuccess } = useToasts()

const search = ref('')
const modalOpen = ref(false)
const deleteModalOpen = ref(false)
const deleteLoading = ref(false)
const bankValue = ref<AppBank | null>(null)

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
  modalOpen.value = true
}

const handleDelete = async () => {
  if (!bankValue.value) return
  deleteLoading.value = true

  try {
    await store.deleteBank(bankValue.value.id)
    showSuccess('Bank został usunięty')
    deleteModalOpen.value = false
  } catch {
    showError('Nie udało się usunąć banku')
  } finally {
    await modalCloseAnimation()
    deleteLoading.value = false
  }
}

onMounted(async () => {
  try {
    await store.fetchBanks()
  } catch {
    showError('Nie udało się pobrać listy banków')
  }
})
</script>

<template>
  <div>
    <SubHeader
      :title="`Banki (${store.banks.length})`"
      create-button
      create-label="Dodaj bank"
      :refresh-loading="store.loading"
      @create="openCreateModal"
      @refresh="store.fetchBanks({ force: true })"
    />

    <div class="my-4">
      <UInput
        v-model="search"
        placeholder="Szukaj po nazwie..."
        icon="i-lucide-search"
        class="w-full md:max-w-xs"
      />
    </div>

    <UTable
      ref="table"
      :data="filteredBanks"
      :columns="[...columns, actionColumn]"
      :loading="store.loading"
      :empty="store.loading ? 'Ładowanie...' : 'Brak banków do wyświetlenia'"
    />

    <!-- MODALS -->
    <ModalFormBank
      v-model:open="modalOpen"
      :row="bankValue"
      @success="modalOpen = false"
    />

    <UiConfirmModal
      v-model:open="deleteModalOpen"
      :title="`Usuń bank '${bankValue?.name ?? ''}'.`"
      description="Czy na pewno chcesz usunąć ten bank? Tej operacji nie można cofnąć."
      :loading="deleteLoading"
      @confirm="handleDelete"
    />
  </div>
</template>
