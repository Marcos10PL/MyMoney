<script setup lang="ts">
type ValueType = string | number | undefined
type ValuesType = ValueType | ValueType[]

const { items, multiple = false } = defineProps<{
  items: { value: ValueType; label: string }[]
  multiple?: boolean
  clearable?: boolean
  disabled?: boolean
  loading?: boolean
}>()

const isOpen = ref(false)

const select = defineModel<ValuesType>('modelValue')

const updateValue = (val: ValueType | ValueType[]) => {
  if (multiple) {
    if (Array.isArray(val)) {
      if (val.includes(undefined)) {
        select.value = []
        isOpen.value = false
        return
      }
      select.value = val.filter(
        (v): v is Exclude<ValueType, undefined> => v !== undefined
      )
    } else {
      select.value = val !== undefined ? [val] : []
    }
  } else {
    select.value = Array.isArray(val) ? val[0] : val
  }
}
</script>

<template>
  <USelect
    v-model:open="isOpen"
    :model-value="select"
    :items
    :disabled
    :loading
    :multiple
    @update:model-value="updateValue"
  >
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
  </USelect>
</template>
