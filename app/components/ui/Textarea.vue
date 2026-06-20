<script setup lang="ts">
import type { TextareaProps } from '@nuxt/ui'

const { size = 'md' } = defineProps<{
  label: string
  name: string
  placeholder?: string
  rows?: number
  required?: boolean
  size?: TextareaProps['size']
}>()

const model = defineModel<string>()
</script>

<template>
  <UFormField :label :name :required class="w-full">
    <UTextarea
      v-model="model"
      class="w-full"
      :placeholder
      :rows="rows ?? 5"
      :size
    />
  </UFormField>
</template>
