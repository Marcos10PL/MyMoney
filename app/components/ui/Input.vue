<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

const {
  required = true,
  disabled = false,
  size = 'md',
  type = 'text',
  label = '',
  autofocus = false,
} = defineProps<{
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  type?: InputProps['type']
  size?: InputProps['size']
  inputUI?: Record<string, unknown>
  inputClass?: string
  disabled?: boolean
  maska?: string
  autofocus?: boolean
  maxLength?: number
}>()

const showPass = ref(false)
const model = defineModel<string | number>()
</script>

<template>
  <UFormField :name :label :required :size class="w-full">
    <UInput
      v-model="model"
      :type="type === 'password' && showPass ? 'text' : type"
      :placeholder
      :size
      class="w-full"
      :class="inputClass"
      :ui="inputUI || { trailing: 'pe-1' }"
      :disabled
      :autofocus
      :max-length
    >
      <template v-if="type === 'password'" #trailing>
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          :icon="showPass ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          :aria-label="showPass ? 'Ukryj hasło' : 'Pokaż hasło'"
          :aria-pressed="showPass"
          @click="showPass = !showPass"
        />
      </template>

      <slot name="trailing" />
    </UInput>
  </UFormField>
</template>
