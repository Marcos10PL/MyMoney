export const useToasts = () => {
  const toast = useToast()

  const showError = (message?: string) => {
    toast.add({
      description: message,
      color: 'error',
    })
  }

  const showSuccess = (message?: string) => {
    toast.add({
      description: message,
      color: 'success',
    })
  }

  return {
    showError,
    showSuccess,
  }
}
