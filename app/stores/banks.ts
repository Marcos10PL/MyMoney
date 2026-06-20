export const useBanksStore = defineStore('banks', () => {
  const banks = ref<AppBank[]>([])
  const loading = ref(false)

  const fetchBanks = async () => {
    loading.value = true
    try {
      const res = await $fetch<APIResponse<AppBank[]>>('/api/banks')
      if (res.success) banks.value = res.data ?? []
    } finally {
      loading.value = false
    }
  }

  const createBank = async (name: string) => {
    const res = await $fetch<APIResponse<AppBank>>('/api/banks', {
      method: 'POST',
      body: { name },
    })
    if (res.success && res.data) banks.value.push(res.data)
  }

  const updateBank = async (id: string, name: string) => {
    const res = await $fetch<APIResponse<AppBank>>(`/api/banks/${id}`, {
      method: 'PUT',
      body: { name },
    })
    if (res.success && res.data) {
      const idx = banks.value.findIndex((b) => b.id === id)
      if (idx !== -1) banks.value[idx] = res.data
    }
  }

  const deleteBank = async (id: string) => {
    const res = await $fetch<APIResponse>(`/api/banks/${id}`, {
      method: 'DELETE',
    })
    if (res.success) banks.value = banks.value.filter((b) => b.id !== id)
  }

  return { banks, loading, fetchBanks, createBank, updateBank, deleteBank }
})
