<script setup lang="ts">
import { UBadge } from '#components'
import type { SortingState } from '@tanstack/vue-table'

const { showError, showSuccess } = useToasts()

const limit = 15
const page = ref(1)

const filters = reactive<TransactionFilters>({
  accountIds: [],
  categoryIds: [],
  dateFrom: undefined,
  dateTo: undefined,
  type: undefined,
})

const dateFilter = computed({
  get: () => ({ dateFrom: filters.dateFrom, dateTo: filters.dateTo }),
  set: (val) => {
    filters.dateFrom = val?.dateFrom
    filters.dateTo = val?.dateTo
  },
})

const DEFAULT_SORT_COL: TransactionsSortableColumns = 'createdAt'
const sorting = ref<SortingState>([{ id: DEFAULT_SORT_COL, desc: true }])

const sortBy = computed(() => sorting.value[0]?.id)
const sortOrder = computed(() => (sorting.value[0]?.desc ? 'desc' : 'asc'))

const search = ref('')
const debouncedSearch = useDebounce(search)

watch([filters, sorting, debouncedSearch], () => {
  page.value = 1
})

const { data, pending, error, refresh } = useLazyFetch('/api/transactions', {
  query: {
    limit,
    page,
    sortBy,
    sortOrder,
    search: debouncedSearch,
    ...toRefs(filters),
  },
})

const modalOpen = ref(false)
const deleteModalOpen = ref(false)
const deleteLoading = ref(false)
const transactionValue = ref<Transaction | null>(null)

const columns = createColumns<Transaction>(
  [
    'name',
    'type',
    'description',
    'amount',
    'date',
    'counterparty',
    'account',
    'category',
    'toAccount',
    'createdAt',
    'updatedAt',
  ],
  {
    name: { isSortable: true },
    type: {
      mapValue: (_, row) =>
        h(
          UBadge,
          { color: TRANSACTION_TYPES_COLORS[row.type], variant: 'subtle' },
          TRANSACTION_TYPES_LABELS[row.type]
        ),
    },
    description: { isPopover: true },
    date: { isDate: true, isSortable: true },
    amount: {
      isCurrency: true,
      isSortable: true,
    },
    account: { mapValue: (_, row) => row.account.name },
    category: {
      mapValue: (_, row) => row.category?.name ?? '--',
    },
    toAccount: {
      mapValue: (_, row) => row.toAccount?.name ?? '--',
    },
    createdAt: { isDate: true, withTime: true, isSortable: true },
    updatedAt: { isDate: true, withTime: true, isSortable: true },
  }
)

const actionColumn = createActionColumn<Transaction>('Akcje', [
  {
    edit: true,
    onClick: (transaction) => {
      transactionValue.value = transaction
      modalOpen.value = true
    },
  },
  {
    delete: true,
    onClick: (transaction) => {
      transactionValue.value = transaction
      deleteModalOpen.value = true
    },
  },
])

const openCreateModal = () => {
  transactionValue.value = null
  modalOpen.value = true
}

const resetModal = async () => {
  transactionValue.value = null
  modalOpen.value = false
  refresh()
}

const handleDelete = async () => {
  if (!transactionValue.value) return
  deleteLoading.value = true

  try {
    await $fetch(`/api/transactions/${transactionValue.value.id}`, {
      method: 'DELETE',
    })
    showSuccess('Transakcja została usunięta')
    deleteModalOpen.value = false
    refresh()
  } catch {
    showError('Nie udało się usunąć transakcji')
  } finally {
    await modalCloseAnimation()
    deleteLoading.value = false
  }
}

watch(error, (err) => {
  if (err) {
    showError('Nie udało się pobrać transakcji')
  }
})

const table = useTemplateRef('table')
const columnVisibility = useLocalStorage('table-columns-transactions', {})
</script>

<template>
  <div>
    <SubHeader
      v-model="columnVisibility"
      :title="`Transakcje (${data?.pagination?.total ?? 0})`"
      create-button
      create-label="Dodaj transakcję"
      :table="table"
      :refresh-loading="pending"
      @create="openCreateModal"
      @refresh="refresh()"
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
          class="*:w-full *:lg:w-52 grid grid-cols-1 md:grid-cols-3 gap-2 w-full lg:w-fit ml-auto"
        >
          <SelectsCategories
            v-model="filters.categoryIds"
            clearable
            multiple
            class="w-full"
          />
          <SelectsAccounts
            v-model="filters.accountIds"
            clearable
            multiple
            class="w-full"
          />
          <SelectsTransactionTypes
            v-model="filters.type"
            clearable
            class="w-full"
          />
        </div>
      </WrappersFilters>
      <UiDatePerset v-model="dateFilter" />
    </div>

    <ClientOnly>
      <UTable
        ref="table"
        v-model:column-visibility="columnVisibility"
        v-model:sorting="sorting"
        :data="(data?.data as unknown as Transaction[]) ?? []"
        :columns="[...columns, actionColumn]"
        :loading="pending"
        :empty="pending ? 'Ładowanie...' : 'Brak transakcji do wyświetlenia'"
        :sorting-options="{ manualSorting: true }"
      />
      <template #fallback>
        <USkeleton
          v-for="i in limit"
          :key="i"
          class="h-12 w-full rounded-md my-2"
        />
      </template>
    </ClientOnly>

    <div class="w-fit ml-auto mt-4">
      <UPagination
        v-model:page="page"
        :items-per-page="limit"
        :sibling-count="0"
        :total="data?.pagination?.total ?? 0"
      />
    </div>

    <!-- MODALS -->
    <ModalFormTransaction
      v-model:open="modalOpen"
      :row="transactionValue"
      @success="resetModal"
    />

    <UiConfirmModal
      v-model:open="deleteModalOpen"
      :title="`Usuń transakcję '${transactionValue?.name ?? ''}'.`"
      description="Czy na pewno chcesz usunąć tę transakcję? Tej operacji nie można cofnąć."
      :loading="deleteLoading"
      @confirm="handleDelete"
    />
  </div>
</template>
