<script setup lang="ts">
defineProps<{
  clearable?: boolean
  multiple?: boolean
}>()

const items = ref([
  {
    value: ACCOUNT_TYPES.CHECKING,
    label: ACCOUNT_TYPES_LABELS[ACCOUNT_TYPES.CHECKING],
  },
  {
    value: ACCOUNT_TYPES.SAVINGS,
    label: ACCOUNT_TYPES_LABELS[ACCOUNT_TYPES.SAVINGS],
  },
  {
    value: ACCOUNT_TYPES.DEPOSIT,
    label: ACCOUNT_TYPES_LABELS[ACCOUNT_TYPES.DEPOSIT],
  },
  {
    value: ACCOUNT_TYPES.INVESTMENT,
    label: ACCOUNT_TYPES_LABELS[ACCOUNT_TYPES.INVESTMENT],
  },
  {
    value: ACCOUNT_TYPES.WALLET,
    label: ACCOUNT_TYPES_LABELS[ACCOUNT_TYPES.WALLET],
  },
  {
    value: ACCOUNT_TYPES.HOME,
    label: ACCOUNT_TYPES_LABELS[ACCOUNT_TYPES.HOME],
  },
  {
    value: ACCOUNT_TYPES.OTHER,
    label: ACCOUNT_TYPES_LABELS[ACCOUNT_TYPES.OTHER],
  },
])

const model = defineModel<string | string[]>()
</script>

<template>
  <UiSelect
    v-model="model"
    :items="items"
    placeholder="Wybierz typ konta..."
    :multiple
    :clearable
  />
</template>
