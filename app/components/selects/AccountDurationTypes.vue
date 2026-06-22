<script setup lang="ts">
defineProps<{
  clearable?: boolean
}>()

const items = ref([
  {
    value: ACCOUNT_DURATION.INDEFINITE,
    label: ACCOUNT_DURATION_LABELS[ACCOUNT_DURATION.INDEFINITE],
  },
  {
    value: ACCOUNT_DURATION.FIXED,
    label: ACCOUNT_DURATION_LABELS[ACCOUNT_DURATION.FIXED],
  },
])

const model = defineModel<string>()
</script>

<template>
  <UiSelect
    v-model="model"
    :items="items"
    placeholder="Wybierz typ konta..."
    :clearable
  />
</template>
