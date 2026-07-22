export const useUiStore = defineStore('ui', () => {
  const hideAmounts = useLocalStorage('hide-amounts', false)

  const toggleHideAmounts = () => {
    hideAmounts.value = !hideAmounts.value
  }

  return { hideAmounts, toggleHideAmounts }
})
