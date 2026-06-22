import type { BankBody } from '~/schemas'

export const useBanksStore = defineStore('banks', () => {
  const banks = ref<AppBank[]>([])
  const loading = ref(false)

  const fetchBanks = async ({ force }: { force?: boolean } = {}) => {
    if (banks.value.length > 0 && !force) return

    loading.value = true
    try {
      const res = await $fetch<APIResponse<AppBank[]>>('/api/banks')
      if (res.success) banks.value = res.data ?? []
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching banks:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createBank = async (body: BankBody) => {
    try {
      const res = await $fetch<APIResponse<AppBank>>('/api/banks', {
        method: 'POST',
        body,
      })
      if (res.success && res.data) banks.value.unshift(res.data)
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error creating bank:', error)
      throw error
    }
  }

  const updateBank = async (id: string, body: BankBody) => {
    try {
      const res = await $fetch<APIResponse<AppBank>>(`/api/banks/${id}`, {
        method: 'PUT',
        body,
      })

      if (res.success && res.data) {
        const idx = banks.value.findIndex((b) => b.id === id)
        if (idx !== -1) banks.value[idx] = res.data
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error updating bank:', error)
      throw error
    }
  }

  const deleteBank = async (id: string) => {
    try {
      const res = await $fetch<APIResponse>(`/api/banks/${id}`, {
        method: 'DELETE',
      })

      if (res.success) banks.value = banks.value.filter((b) => b.id !== id)
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error deleting bank:', error)
      throw error
    }
  }

  return { banks, loading, fetchBanks, createBank, updateBank, deleteBank }
})
