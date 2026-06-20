<script setup lang="ts">
import {
  type CalendarDate,
  getLocalTimeZone,
  today,
} from '@internationalized/date'

const tz = getLocalTimeZone()

const maxValue = today(tz)
const defaultPlaceholder = today(tz).subtract({ months: 1 })

const model = defineModel<{
  start: CalendarDate | undefined
  end: CalendarDate | undefined
}>()

defineOptions({ inheritAttrs: false })

const label = computed(() => {
  const start = model.value?.start
  const end = model.value?.end

  if (!start) return 'Wybierz datę...'

  const fmt = (d: CalendarDate) => formatDate(d.toString())

  return end ? `${fmt(start)} - ${fmt(end)}` : fmt(start)
})
</script>

<template>
  <UPopover>
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-calendar"
      :label="label"
      v-bind="$attrs"
    >
      <template v-if="model?.start" #trailing>
        <UIcon
          name="i-lucide-x"
          class="size-4 shrink-0 opacity-60 hover:opacity-100 ml-auto"
          @click.stop="model = { start: undefined, end: undefined }"
        />
      </template>
    </UButton>
    <template #content>
      <UCalendar
        v-model="model"
        class="p-2"
        :number-of-months="2"
        :max-value
        :default-placeholder
        range
        locale="pl-PL"
      />
    </template>
  </UPopover>
</template>
