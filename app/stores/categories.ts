import type { CategoryBody } from '~/schemas'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)

  const fetchCategories = async ({ force }: { force?: boolean } = {}) => {
    if (categories.value.length > 0 && !force) return

    loading.value = true
    try {
      const res = await $fetch<APIResponse<Category[]>>('/api/categories')
      if (res.success) categories.value = res.data ?? []
    } catch (error) {
      if (import.meta.env.DEV)
        console.error('Failed to fetch categories', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createCategory = async (body: CategoryBody) => {
    try {
      const res = await $fetch<APIResponse<Category>>('/api/categories', {
        method: 'POST',
        body,
      })
      if (res.success && res.data) categories.value.unshift(res.data)
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to create category', error)
      throw error
    }
  }

  const updateCategory = async (id: string, body: CategoryBody) => {
    try {
      const res = await $fetch<APIResponse<Category>>(`/api/categories/${id}`, {
        method: 'PUT',
        body,
      })
      if (res.success && res.data) {
        const index = categories.value.findIndex((c) => c.id === id)
        if (index !== -1) categories.value[index] = res.data
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to update category', error)
      throw error
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const res = await $fetch<APIResponse>(`/api/categories/${id}`, {
        method: 'DELETE',
      })
      if (res.success)
        categories.value = categories.value.filter((c) => c.id !== id)
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to delete category', error)
      throw error
    }
  }

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
