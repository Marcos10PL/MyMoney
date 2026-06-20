<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

const {
  required = true,
  disabled = false,
  size = 'md',
  label = '',
  autofocus = false,
  stepSnapping = false,
} = defineProps<{
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  size?: InputProps['size']
  inputUI?: InputProps['ui']
  inputClass?: string
  disabled?: boolean
  maska?: string
  autofocus?: boolean
  min?: number
  max?: number
  step?: number
  formatOptions?: Intl.NumberFormatOptions
  stepSnapping?: boolean
}>()

const model = defineModel<number | null>()
</script>

<template>
  <UFormField :name :label :required :size class="w-full">
    <UInputNumber
      v-model="model"
      :placeholder
      :size
      class="w-full"
      :class="inputClass"
      :ui="inputUI || { trailing: 'pe-1' }"
      :disabled
      :autofocus
      :min
      :max
      :step
      :step-snapping
      :format-options="formatOptions"
      locale="pl-PL"
    />
  </UFormField>
</template>
