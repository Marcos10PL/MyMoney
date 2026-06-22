export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  if (import.meta.server) {
    return ref<T>(defaultValue)
  }

  const stored = localStorage.getItem(key)
  const data = ref<T>(stored ? JSON.parse(stored) : defaultValue)

  watch(
    data,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )

  return data
}
