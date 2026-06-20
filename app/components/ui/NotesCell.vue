<script setup lang="ts">
defineProps<{ text: string }>()
</script>

<template>
  <UPopover :content="{ align: 'end' }" :ui="{ content: 'max-w-screen' }">
    <UTooltip text="Pokaż">
      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        icon="lucide:eye"
        class="cursor-pointer"
      />
    </UTooltip>

    <template #content>
      <div
        class="text-xs p-3 max-h-64 overflow-y-auto max-w-[calc(100vw-2rem)]"
      >
        {{ text }}
      </div>
    </template>
  </UPopover>
</template>
