<script setup lang="ts">
const { exclude } = defineProps<{
  clearable?: boolean
  multiple?: boolean
  exclude?: Transaction['type'][]
}>()

const items = ref(
  [
    {
      value: TRANSACTION_TYPES.INCOME,
      label: TRANSACTION_TYPES_LABELS[TRANSACTION_TYPES.INCOME],
    },
    {
      value: TRANSACTION_TYPES.EXPENSE,
      label: TRANSACTION_TYPES_LABELS[TRANSACTION_TYPES.EXPENSE],
    },
    {
      value: TRANSACTION_TYPES.LOAN_GIVEN,
      label: TRANSACTION_TYPES_LABELS[TRANSACTION_TYPES.LOAN_GIVEN],
    },
    {
      value: TRANSACTION_TYPES.LOAN_RETURNED,
      label: TRANSACTION_TYPES_LABELS[TRANSACTION_TYPES.LOAN_RETURNED],
    },
    {
      value: TRANSACTION_TYPES.TRANSFER,
      label: TRANSACTION_TYPES_LABELS[TRANSACTION_TYPES.TRANSFER],
    },
  ].filter((item) => !exclude?.includes(item.value))
)

const model = defineModel<string | string[]>()
</script>

<template>
  <UiSelect
    v-model="model"
    :items="items"
    placeholder="Wybierz typ transakcji..."
    :multiple
    :clearable
  />
</template>
