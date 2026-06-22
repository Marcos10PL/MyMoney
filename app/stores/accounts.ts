import type { AccountBody } from '~/schemas'

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([])
  const loading = ref(false)

  const fetchAccounts = async ({ force }: { force?: boolean } = {}) => {
    if (accounts.value.length > 0 && !force) return

    loading.value = true
    try {
      const res = await $fetch<APIResponse<Account[]>>('/api/accounts')
      if (res.success) accounts.value = res.data ?? []
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching accounts:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createAccount = async (body: AccountBody) => {
    try {
      const res = await $fetch<APIResponse<Account>>('/api/accounts', {
        method: 'POST',
        body,
      })
      if (res.success && res.data) accounts.value.unshift(res.data)
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error creating account:', error)
      throw error
    }
  }

  const updateAccount = async (id: string, body: AccountBody) => {
    try {
      const res = await $fetch<APIResponse<Account>>(`/api/accounts/${id}`, {
        method: 'PUT',
        body,
      })

      if (res.success && res.data) {
        const idx = accounts.value.findIndex((a) => a.id === id)
        if (idx !== -1) accounts.value[idx] = res.data
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error updating account:', error)
      throw error
    }
  }

  const deleteAccount = async (id: string) => {
    try {
      const res = await $fetch<APIResponse>(`/api/accounts/${id}`, {
        method: 'DELETE',
      })

      if (res.success)
        accounts.value = accounts.value.filter((a) => a.id !== id)
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error deleting account:', error)
      throw error
    }
  }

  return {
    accounts,
    loading,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  }
})
