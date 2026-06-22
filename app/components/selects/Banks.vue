<script setup lang="ts">
defineProps<{
  clearable?: boolean
}>()

const store = useBanksStore()

onMounted(() => store.fetchBanks())

const items = computed(() => {
  return store.banks.map((bank) => ({
    value: bank.id,
    label: bank.name,
  }))
})

const model = defineModel<string>()

const displayModel = computed({
  get: () => (items.value.length ? model.value : undefined),
  set: (val) => {
    model.value = val
  },
})
</script>

<template>
  <UiSelectMenu
    v-model="displayModel"
    :items="items"
    placeholder="Wybierz bank..."
    :loading="store.loading"
    :clearable
  />
</template>
