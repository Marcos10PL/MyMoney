<script setup lang="ts">
const { multiple } = defineProps<{
  clearable?: boolean
  multiple?: boolean
}>()

const store = useAccountsStore()

onMounted(() => store.fetchAccounts())

const items = computed(() => {
  return store.accounts.map((account) => ({
    value: account.id,
    label: account.name,
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
    placeholder="Wybierz konto..."
    :loading="store.loading"
    :clearable
    :multiple
  />
</template>
