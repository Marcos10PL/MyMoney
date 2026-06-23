<script setup lang="ts">
const model = defineModel<string>()

const items = ref<
  { value: string; label: string; counterparty: Transaction['counterparty'] }[]
>([])
const loading = ref(false)
const searchString = ref('')

const debouncedSearch = useDebounce(searchString, 300)
const { showError } = useToasts()

const emit = defineEmits<{
  (e: 'select', contractorName: Transaction['counterparty']): void
}>()

const fetchLoanTransactions = async (searchQuery = '') => {
  loading.value = true
  try {
    const res = await $fetch('/api/transactions/loans-unpaid', {
      query: { search: searchQuery || undefined },
    })

    if (res?.data) {
      items.value = res.data.map((tx) => ({
        value: tx.id,
        label: `${tx.name} (${formatCurrency(Number(tx.remainingAmount))})`,
        counterparty: tx.counterparty,
      }))
    }
  } catch {
    showError('Błąd pobierania transakcji')
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchLoanTransactions())

watch(debouncedSearch, (newValue) => {
  fetchLoanTransactions(newValue)
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSelect = (selectedValue: any) => {
  const selectedItem = items.value.find((item) => item.value === selectedValue)
  if (selectedItem) emit('select', selectedItem.counterparty)
}
</script>

<template>
  <UiSelectMenu
    v-model="model"
    v-model:search-term="searchString"
    :items="items"
    :loading="loading"
    placeholder="Wybierz pożyczkę..."
    clearable
    @update:model-value="handleSelect"
  />
</template>
