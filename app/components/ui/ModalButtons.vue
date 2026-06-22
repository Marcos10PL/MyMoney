<script setup lang="ts">
defineProps<{
  label: string
  loading?: boolean
  type: 'error' | 'primary'
}>()

const emit = defineEmits<{
  (e: 'confirm' | 'cancel'): void
}>()
</script>

<template>
  <div class="w-full flex justify-end gap-2 ml-auto sm:max-w-44">
    <slot>
      <UButton
        variant="subtle"
        color="neutral"
        type="button"
        :disabled="loading"
        block
        @click="emit('cancel')"
      >
        Anuluj
      </UButton>
      <UButton
        :color="type === 'error' ? 'error' : 'primary'"
        block
        :loading="loading"
        type="submit"
        @click="emit('confirm')"
        @keydown.enter="emit('confirm')"
      >
        {{ label }}
      </UButton>
    </slot>
  </div>
</template>
