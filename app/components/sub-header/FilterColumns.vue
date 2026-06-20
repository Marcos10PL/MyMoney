<script setup lang="ts">
const props = defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any
}>()

const toggle = (id: string, checked: boolean) => {
  props.table?.tableApi?.getColumn(id)?.toggleVisibility(checked)
}
</script>

<template>
  <UDropdownMenu
    :items="
      table?.tableApi
        ?.getAllColumns()
        .filter((column: any) => column.getCanHide())
        .map((column: any) => ({
          label: tableColumnsTranslate(column.id),
          type: 'checkbox' as const,
          checked: column.getIsVisible(),
          onUpdateChecked(checked: boolean) {
            toggle(column.id, checked)
          },
          onSelect(e: Event) {
            e.preventDefault()
          },
        }))
    "
    :content="{ align: 'end' }"
    :ui="{
      content: 'overflow-y-auto max-h-[calc(100vh-150px)]',
    }"
  >
    <UButton
      label="Kolumny"
      color="neutral"
      variant="outline"
      trailing-icon="i-lucide-chevron-down"
      class="justify-between font-normal"
    />
  </UDropdownMenu>
</template>
