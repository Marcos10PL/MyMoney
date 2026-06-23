<script lang="ts" setup>
defineProps<{
  label: string
}>()

const percent = defineModel<number>({ default: 0 })
</script>

<template>
  <div
    class="flex flex-col gap-4 border border-primary/10 bg-primary/5 rounded-xl p-4"
  >
    <USeparator
      vertical
      class="h-1 mt-[-1.2rem]"
      :label
      :ui="{
        label: 'opacity-90 uppercase text-[0.7rem] font-bold',
      }"
    />
    <div class="flex items-center gap-2">
      <UProgress v-model="percent" size="sm" />
      <UBadge variant="soft" color="neutral">{{ percent }}%</UBadge>
    </div>
  </div>
</template>
