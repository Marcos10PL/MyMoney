<script setup lang="ts">
const { type, multiple } = defineProps<{
  clearable?: boolean
  multiple?: boolean
  type?: Category['type']
}>()

const store = useCategoriesStore()

onMounted(() => store.fetchCategories())

const items = computed(() => {
  let categories = store.categories

  if (type) categories = categories.filter((category) => category.type === type)

  return categories.map((category) => ({
    value: category.id,
    label: category.name,
  }))
})

const model = defineModel<string | string[]>()

const displayModel = computed({
  get: () => {
    if (items.value.length) return model.value
    return multiple ? [] : undefined
  },
  set: (val) => {
    model.value = val
  },
})
</script>

<template>
  <UiSelectMenu
    v-model="displayModel"
    :items="items"
    placeholder="Wybierz kategorię..."
    :loading="store.loading"
    :clearable
    :multiple
  />
</template>
