<script setup lang="ts">
defineProps<{
  clearable?: boolean
  multiple?: boolean
}>()

const items = Object.entries(ASSET_TYPE_META).map(([value, meta]) => ({
  value,
  label: meta.label,
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
