<script setup lang="ts">
const open = ref(false)
</script>

<template>
  <div>
    <UButton
      class="w-full lg:hidden justify-between mb-2"
      color="neutral"
      variant="soft"
      @click="open = !open"
    >
      Filtry
      <UIcon
        name="i-lucide-chevron-down"
        class="size-4 transition-transform"
        :class="open ? 'rotate-180' : ''"
      />
    </UButton>
    <div
      class="overflow-hidden transition-all duration-300 lg:max-h-none!"
      :class="open ? 'max-h-96' : 'max-h-0'"
    >
      <slot />
    </div>
  </div>
</template>
