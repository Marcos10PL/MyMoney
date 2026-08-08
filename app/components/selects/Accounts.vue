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
    label: `${account.name}${account.bank ? ` (${account.bank.name})` : ''}`,
    balance: account.balance,
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
  >
    <template #item="{ item }">
      <span class="flex-1 truncate">{{ item.label }}</span>
      <span class="text-xs text-muted font-mono ml-2 shrink-0">
        {{
          (item.balance as number).toLocaleString('pl-PL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        }}
        PLN
      </span>
    </template>
  </UiSelectMenu>
</template>
