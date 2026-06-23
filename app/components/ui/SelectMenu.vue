<script setup lang="ts">
type ValueType = string | number | undefined
type ValuesType = ValueType | ValueType[]
type Item = { value: ValueType; label: string } & Record<string, unknown>

const { items, multiple = false } = defineProps<{
  items: Item[]
  multiple?: boolean
  clearable?: boolean
  disabled?: boolean
  loading?: boolean
}>()

const isOpen = ref(false)

const select = defineModel<ValuesType | null>('modelValue')

const selectedItem = computed({
  get: () => {
    if (multiple) {
      return items.filter((i) =>
        Array.isArray(select.value)
          ? select.value.includes(i.value)
          : select.value === i.value
      )
    }
    return items.find((i) => i.value === select.value) ?? undefined
  },
  set: (val) => {
    if (Array.isArray(val)) {
      select.value = val.map((v) => v.value)
    } else {
      select.value = val?.value
    }
  },
})

const searchInput = defineModel<string>('searchTerm', { default: '' })
</script>

<template>
  <USelectMenu
    v-model:open="isOpen"
    v-model="selectedItem"
    v-model:search-term="searchInput"
    :items
    :disabled
    :multiple
    :loading
    :search-input="{ placeholder: 'Szukaj...' }"
  >
    <template #empty> Brak wyników </template>

    <template v-if="$slots.trailing" #trailing>
      <slot name="trailing" />
    </template>

    <template v-if="$slots.item" #item="slotProps">
      <slot name="item" v-bind="slotProps" />
    </template>

    <template v-if="clearable" #content-bottom>
      <UButton
        variant="soft"
        class="justify-center rounded-t-none"
        @click="
          () => {
            select = multiple ? [] : undefined
            isOpen = false
          }
        "
      >
        Wyczyść
      </UButton>
    </template>
  </USelectMenu>
</template>
