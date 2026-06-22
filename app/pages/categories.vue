<script setup lang="ts">
const store = useCategoriesStore()
const { showError, showSuccess } = useToasts()

const modalOpen = ref(false)
const deleteModalOpen = ref(false)
const deleteLoading = ref(false)
const categoryValue = ref<Category | null>(null)

const search = ref('')
const categoryType = ref('')

const filteredCategories = computed(() => {
  const term = search.value.trim().toLowerCase()

  return store.categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(term)

    const matchesType =
      !categoryType.value || category.type === categoryType.value

    return matchesSearch && matchesType
  })
})

const columns = createColumns<Category>(['name', 'type'], {
  name: { isSortable: true },
  type: {
    mapValue: (_value, row) => CATEGORY_TYPES_LABELS[row.type],
  },
})

const actionColumn = createActionColumn<Category>('Akcje', [
  {
    edit: true,
    onClick: (category) => {
      categoryValue.value = category
      modalOpen.value = true
    },
  },
  {
    delete: true,
    onClick: (category) => {
      categoryValue.value = category
      deleteModalOpen.value = true
    },
  },
])

const openCreateModal = () => {
  categoryValue.value = null
  modalOpen.value = true
}

const resetModal = async () => {
  modalOpen.value = false
  categoryValue.value = null
}

const handleDelete = async () => {
  if (!categoryValue.value) return
  deleteLoading.value = true

  try {
    await store.deleteCategory(categoryValue.value.id)
    showSuccess('Kategoria została usunięta')
    deleteModalOpen.value = false
  } catch {
    showError('Nie udało się usunąć kategorii')
  } finally {
    await modalCloseAnimation()
    deleteLoading.value = false
  }
}

onMounted(async () => {
  try {
    await store.fetchCategories()
  } catch {
    showError('Nie udało się pobrać kategorii')
  }
})
</script>

<template>
  <div>
    <SubHeader
      :title="`Kategorie (${store.categories.length})`"
      create-button
      create-label="Dodaj kategorię"
      :refresh-loading="store.loading"
      @create="openCreateModal"
      @refresh="store.fetchCategories({ force: true })"
    />

    <div class="my-4 flex flex-col sm:flex-row gap-2">
      <UInput
        v-model="search"
        placeholder="Szukaj po nazwie lub typie..."
        icon="i-lucide-search"
        class="w-full sm:max-w-xs"
      />
      <SelectsCategoryTypes
        v-model="categoryType"
        clearable
        class="w-full sm:w-xs"
      />
    </div>

    <UTable
      ref="table"
      :data="filteredCategories"
      :columns="[...columns, actionColumn]"
      :loading="store.loading"
      :empty="store.loading ? 'Ładowanie...' : 'Brak kategorii do wyświetlenia'"
    />

    <ModalFormCategory
      v-model:open="modalOpen"
      :row="categoryValue"
      @success="resetModal"
    />

    <UiConfirmModal
      v-model:open="deleteModalOpen"
      :title="`Usuń kategorię '${categoryValue?.name ?? ''}'.`"
      description="Czy na pewno chcesz usunąć tę kategorię? Tej operacji nie można cofnąć."
      :loading="deleteLoading"
      @confirm="handleDelete"
    />
  </div>
</template>
