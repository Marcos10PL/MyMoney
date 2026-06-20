<script setup lang="ts">
const {
  confirmLabel = 'Usuń',
  loading = false,
  type = 'error',
} = defineProps<{
  title?: string
  description?: string
  confirmLabel?: string
  loading?: boolean
  type?: 'error' | 'primary'
}>()

defineEmits<{ (e: 'confirm'): void }>()

const open = defineModel<boolean>('open')
</script>

<template>
  <UModal
    v-model:open="open"
    :title
    :description
    :ui="{
      footer: 'min-w-full',
    }"
  >
    <template #footer>
      <UiModalButtons
        :label="confirmLabel"
        :loading="loading"
        :type
        @confirm="$emit('confirm')"
        @cancel="open = false"
      />
    </template>
  </UModal>
</template>
