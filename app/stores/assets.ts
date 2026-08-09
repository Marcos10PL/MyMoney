export const useAssetsStore = defineStore('assets', () => {
  const assets = ref<Asset[]>([])
  const loading = ref(false)

  const fetchAssets = async ({ force }: { force?: boolean } = {}) => {
    if (assets.value.length > 0 && !force) return

    loading.value = true
    try {
      const res = await $fetch<APIResponse<Asset[]>>('/api/investments/assets')
      if (res.success) assets.value = res.data ?? []
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching assets:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return { assets, loading, fetchAssets }
})
