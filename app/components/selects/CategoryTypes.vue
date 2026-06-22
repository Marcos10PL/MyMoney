<script setup lang="ts">
defineProps<{
  clearable?: boolean
}>()

const items = ref([
  {
    value: CATEGORY_TYPES.INCOME,
    label: CATEGORY_TYPES_LABELS[CATEGORY_TYPES.INCOME],
  },
  {
    value: CATEGORY_TYPES.EXPENSE,
    label: CATEGORY_TYPES_LABELS[CATEGORY_TYPES.EXPENSE],
  },
])

const model = defineModel<string>()
</script>

<template>
  <UiSelect
    v-model="model"
    :items="items"
    placeholder="Wybierz typ kategorii..."
    :clearable
  />
</template>
