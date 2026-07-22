<script setup lang="ts">
const uiStore = useUiStore()
const { hideAmounts } = storeToRefs(uiStore)
const { toggleHideAmounts } = uiStore
</script>

<template>
  <UTooltip :text="hideAmounts ? 'Pokaż kwoty' : 'Ukryj kwoty'">
    <UButton
      :icon="hideAmounts ? 'lucide-eye-off' : 'lucide-eye'"
      color="neutral"
      variant="ghost"
      :aria-label="hideAmounts ? 'Pokaż kwoty' : 'Ukryj kwoty'"
      @click="toggleHideAmounts"
    />
  </UTooltip>
</template>
