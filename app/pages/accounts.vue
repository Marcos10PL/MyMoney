<script setup lang="ts">
const store = useAccountsStore()
const { showError, showSuccess } = useToasts()

const modalOpen = ref(false)
const deleteModalOpen = ref(false)
const deleteLoading = ref(false)
const accountValue = ref<Account | null>(null)

const search = ref('')
const accountType = ref<string[]>([])
const isActive = ref<boolean>()
const isFree = ref<boolean>()
const duration = ref<string>()

const filteredAccounts = computed(() => {
  const term = search.value.trim().toLowerCase()

  return store.accounts.filter((account) => {
    const matchesSearch = account.name.toLowerCase().includes(term)

    const matchesType =
      !accountType.value.length || accountType.value.includes(account.type)

    const matchesIsActive =
      isActive.value === undefined || account.isActive === isActive.value

    const matchesIsFree =
      isFree.value === undefined || account.isFree === isFree.value

    const matchesDuration =
      duration.value === undefined || account.duration === duration.value

    return (
      matchesSearch &&
      matchesType &&
      matchesIsActive &&
      matchesIsFree &&
      matchesDuration
    )
  })
})

const columns = createColumns<Account>(
  [
    'name',
    'type',
    'description',
    'percentage',
    'bank',
    'isFree',
    'conditions',
    'startDate',
    'duration',
    'durationEndDate',
    'isActive',
  ],
  {
    name: { isSortable: true },
    type: {
      mapValue: (_value, row) => ACCOUNT_TYPES_LABELS[row.type],
    },
    bank: {
      mapValue: (_value, row) => row.bank?.name ?? '--',
    },
    startDate: { isDate: true, isSortable: true },
    durationEndDate: { isDate: true, isSortable: true },
    duration: {
      mapValue: (_value, row) => ACCOUNT_DURATION_LABELS[row.duration],
    },
    isActive: { isBoolean: true },
    isFree: { isBoolean: true },
    percentage: { isPercentage: true, isSortable: true },
    description: { isPopover: true },
    conditions: { isPopover: true },
  }
)

const actionColumn = createActionColumn<Account>('Akcje', [
  {
    edit: true,
    onClick: (account) => {
      accountValue.value = account
      modalOpen.value = true
    },
  },
  {
    delete: true,
    onClick: (account) => {
      accountValue.value = account
      deleteModalOpen.value = true
    },
  },
])

const openCreateModal = () => {
  accountValue.value = null
  modalOpen.value = true
}

const resetModal = async () => {
  accountValue.value = null
  modalOpen.value = false
}

const handleDelete = async () => {
  if (!accountValue.value) return
  deleteLoading.value = true

  try {
    await store.deleteAccount(accountValue.value.id)
    showSuccess('Konto zostało usunięte')
    deleteModalOpen.value = false
  } catch {
    showError('Nie udało się usunąć konta')
  } finally {
    await modalCloseAnimation()
    deleteLoading.value = false
  }
}

onMounted(async () => {
  try {
    await store.fetchAccounts()
  } catch {
    showError('Nie udało się pobrać kont')
  }
})

const table = useTemplateRef('table')
const columnVisibility = useLocalStorage('table-columns-orders', {})
</script>

<template>
  <div>
    <SubHeader
      v-model="columnVisibility"
      :title="`Konta (${store.accounts.length})`"
      create-button
      create-label="Dodaj konto"
      :table="table"
      :refresh-loading="store.loading"
      @create="openCreateModal"
      @refresh="store.fetchAccounts({ force: true })"
    />

    <div class="my-4 flex flex-col lg:flex-row justify-between gap-2 flex-wrap">
      <UInput
        v-model="search"
        placeholder="Szukaj po nazwie lub typie..."
        icon="i-lucide-search"
        class="w-full lg:max-w-xs"
      />
      <WrappersFilters class="w-full lg:w-fit ml-auto">
        <div
          class="*:w-full *:lg:w-52 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-full lg:w-fit ml-auto"
        >
          <SelectsAccountTypes v-model="accountType" clearable multiple />
          <UiSelect
            v-model="isFree"
            clearable
            :items="[
              { label: 'Tylko darmowe', value: true },
              { label: 'Tylko płatne', value: false },
            ]"
            placeholder="Tylko darmowe"
          />
          <UiSelect
            v-model="isActive"
            clearable
            :items="[
              { label: 'Tylko aktywne', value: true },
              { label: 'Tylko nieaktywne', value: false },
            ]"
            placeholder="Tylko aktywne"
          />
          <SelectsAccountDurationTypes v-model="duration" clearable />
        </div>
      </WrappersFilters>
    </div>

    <ClientOnly>
      <UTable
        ref="table"
        v-model:column-visibility="columnVisibility"
        :data="filteredAccounts"
        :columns="[...columns, actionColumn]"
        :loading="store.loading"
        :empty="store.loading ? 'Ładowanie...' : 'Brak kont do wyświetlenia'"
      />
      <template #fallback>
        <USkeleton
          v-for="i in 15"
          :key="i"
          class="h-12 w-full rounded-md my-2"
        />
      </template>
    </ClientOnly>

    <ModalFormAccount
      v-model:open="modalOpen"
      :row="accountValue"
      @success="resetModal"
    />

    <UiConfirmModal
      v-model:open="deleteModalOpen"
      :title="`Usuń konto '${accountValue?.name ?? ''}'.`"
      description="Czy na pewno chcesz usunąć to konto? Wszytskie transakcje związane z tym kontem zostaną również usunięte. Tej operacji nie można cofnąć."
      :loading="deleteLoading"
      @confirm="handleDelete"
    />
  </div>
</template>
