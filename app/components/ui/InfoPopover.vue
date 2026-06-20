<script setup lang="ts">
import type { ButtonProps } from '#ui/types'

const { align = 'center', type = 'info' } = defineProps<{
  description?: string
  type?: 'info' | 'warning'
  align?: 'start' | 'center' | 'end'
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  color?: ButtonProps['color']
}>()
</script>

<template>
  <UPopover
    :content="{
      align,
    }"
  >
    <UButton
      :size="size"
      :color="color ? color : type === 'warning' ? 'warning' : 'neutral'"
      :variant="variant || 'outline'"
      class="cursor-pointer"
      :icon="type === 'warning' ? 'lucide:alert-triangle' : 'lucide:info'"
      @click.stop
    />

    <template #content>
      <slot>
        <div class="text-sm p-2 text-wrap max-w-64">
          {{ description }}
        </div>
      </slot>
    </template>
  </UPopover>
</template>
