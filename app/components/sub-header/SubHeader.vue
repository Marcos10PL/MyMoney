<script setup lang="ts">
type CreateProps =
  | { createButton: true; createLabel: string }
  | { createButton?: false; createLabel?: never }

type TableProps =
  // eslint-disable-next-line
  { table?: any }

type Props = CreateProps &
  TableProps & {
    title?: string
    refreshLoading?: boolean
    showActionsPin?: boolean
  }

const { table, showActionsPin = true } = defineProps<Props>()

const columnVisibility = defineModel<Record<string, boolean>>({
  default: () => ({}),
})
const emit = defineEmits<{ (e: 'create' | 'refresh'): void }>()

const hasActions = computed(
  () =>
    showActionsPin &&
    table?.tableApi
      ?.getAllColumns()
      // eslint-disable-next-line
      .some((col: any) => col.id === ACTIONS_ID_COLUMN)
)

const pinActions = ref(false)
let el: HTMLElement | null = null

onMounted(() => {
  pinActions.value = window.innerWidth >= 640
  el = document.querySelector('.layout-main')

  if (el && pinActions.value) {
    el.classList.add('pin-actions')
  }
})

watch(pinActions, (newVal) => {
  if (!el) return
  if (newVal) {
    el.classList.add('pin-actions')
  } else {
    el.classList.remove('pin-actions')
  }
})
</script>

<template>
  <div
    class="flex flex-col sm:flex-row gap-2 items-center justify-between mb-2 border-b border-default pb-4"
  >
    <div class="flex flex-col sm:flex-row gap-2 items-center w-full">
      <slot name="header">
        <div
          class="flex gap-2 items-center w-full sm:w-auto self-start sm:self-auto pb-2 sm:pb-0"
        >
          <h2 v-if="title" class="font-medium">
            {{ title }}
          </h2>
          <UTooltip v-if="refreshLoading !== undefined" text="Odśwież dane">
            <UButton
              variant="soft"
              :loading="refreshLoading || false"
              class="cursor-pointer"
              icon="material-symbols:refresh-rounded"
              @click="emit('refresh')"
            />
          </UTooltip>
        </div>
      </slot>
      <UButton
        v-if="createButton"
        :label="createLabel"
        color="primary"
        variant="soft"
        class="cursor-pointer w-full sm:w-auto"
        icon="lucide-plus"
        @click="emit('create')"
      />
    </div>

    <div
      v-if="table"
      class="flex flex-col-reverse sm:flex-row items-center gap-2 w-full sm:w-auto"
    >
      <slot />
      <div class="flex gap-2 items-center w-full">
        <SubHeaderFilterColumns
          v-model="columnVisibility"
          :table
          class="w-full"
        />
        <UTooltip
          v-if="hasActions"
          :text="pinActions ? 'Odepnij akcje' : 'Przypnij akcje'"
        >
          <UButton
            variant="subtle"
            class="cursor-pointer"
            :icon="
              pinActions
                ? 'material-symbols:keep-off-outline'
                : 'material-symbols:keep-outline'
            "
            @click="pinActions = !pinActions"
          />
        </UTooltip>
      </div>
    </div>
  </div>
</template>
