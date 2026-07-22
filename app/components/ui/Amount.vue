<script setup lang="ts">
const { hideAmounts } = storeToRefs(useUiStore())

const { value } = defineProps<{
  value?: number | null
  options?: Parameters<typeof formatCurrency>[1]
}>()
</script>

<template>
  <span
    v-if="hideAmounts"
    class="inline-block h-[1.1em] bg-muted align-middle w-[4.5em] rounded-md"
  ></span>
  <span v-else>{{ formatCurrency(value, options) }}</span>
</template>
