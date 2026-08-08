<script setup lang="ts">
defineProps<{
  clearable?: boolean
  multiple?: boolean
}>()

const items = Object.entries(ASSET_TYPES_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const model = defineModel<string | string[]>()
</script>

<template>
  <UiSelect
    v-model="model"
    :items="items"
    placeholder="Wybierz typ aktywa..."
    :multiple
    :clearable
  />
</template>
