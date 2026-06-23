export const useDebounce = <T>(value: Ref<T>, delay: number = 300): Ref<T> => {
  const debouncedValue = ref(value.value) as Ref<T>
  let timeout: NodeJS.Timeout

  watch(value, (newValue) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}
