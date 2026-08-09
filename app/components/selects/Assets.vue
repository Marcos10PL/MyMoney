<script setup lang="ts">
const store = useAssetsStore()

onMounted(() => store.fetchAssets())

const items = computed(() =>
  store.assets.map((asset) => ({
    value: asset.id,
    label: asset.name,
    type: asset.type,
    currentValue: asset.currentValue,
  }))
)

const model = defineModel<string>()

const displayModel = computed({
  get: () => (items.value.length ? model.value : undefined),
  set: (val) => {
    model.value = val
  },
})
</script>

<template>
  <UiSelectMenu
    v-model="displayModel"
    :items="items"
    placeholder="Wybierz aktywo..."
    :loading="store.loading"
  >
    <template #item="{ item }">
      <span class="flex-1 truncate">{{ item.label }}</span>
      <span class="text-xs text-muted ml-2 shrink-0">
        {{ ASSET_TYPES_LABELS[item.type as AppAssetType] }}
      </span>
    </template>
  </UiSelectMenu>
</template>
