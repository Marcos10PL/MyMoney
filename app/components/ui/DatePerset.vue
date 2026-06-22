<script setup lang="ts">
import {
  type CalendarDate,
  getLocalTimeZone,
  today,
} from '@internationalized/date'

const model = defineModel<{
  dateFrom: string | undefined
  dateTo: string | undefined
}>()

type Preset =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'last_week'
  | 'last_month'
  | 'custom'

const preset = ref<Preset>('all')

const customRange = shallowRef<{
  start: CalendarDate | undefined
  end: CalendarDate | undefined
}>({
  start: undefined,
  end: undefined,
})

const presetItems: { value: Preset; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'today', label: 'Dzisiaj' },
  { value: 'yesterday', label: 'Wczoraj' },
  { value: 'last_week', label: 'Ostatni tydzień' },
  { value: 'last_month', label: 'Ostatni miesiąc' },
  { value: 'custom', label: 'Niestandardowy' },
]

const applyPreset = (value: Preset) => {
  if (value === 'all' || value === 'custom') {
    model.value = { dateFrom: undefined, dateTo: undefined }
    return
  }

  const now = today(getLocalTimeZone())

  const map: Record<
    Exclude<Preset, 'all' | 'custom'>,
    { dateFrom: string; dateTo: string }
  > = {
    today: { dateFrom: now.toString(), dateTo: now.toString() },
    yesterday: {
      dateFrom: now.subtract({ days: 1 }).toString(),
      dateTo: now.subtract({ days: 1 }).toString(),
    },
    last_week: {
      dateFrom: now.subtract({ days: 7 }).toString(),
      dateTo: now.toString(),
    },
    last_month: {
      dateFrom: now.subtract({ days: 30 }).toString(),
      dateTo: now.toString(),
    },
  }

  model.value = map[value]
}

watch(preset, (val) => {
  applyPreset(val)
})

watch(customRange, (val) => {
  if (preset.value !== 'custom') return

  model.value = {
    dateFrom: val.start?.toString(),
    dateTo: val.end?.toString(),
  }
})
</script>

<template>
  <div class="w-full flex-col md:flex-row flex gap-2 items-center">
    <USelect v-model="preset" :items="presetItems" class="w-full lg:w-42" />
    <UiInputDate
      v-if="preset === 'custom'"
      v-model="customRange"
      class="w-full lg:w-auto min-w-40"
    />
  </div>
</template>
