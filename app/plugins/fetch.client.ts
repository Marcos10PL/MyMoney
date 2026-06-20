export default defineNuxtPlugin(() => {
  const { fetch: refreshSession } = useUserSession()
  const { showError } = useToasts()

  const originalFetch = globalThis.$fetch
  let loggingOut = false

  globalThis.$fetch = $fetch.create({
    onResponseError: async ({ response, request }) => {
      const url = new URL(String(request), 'http://localhost')
      const isAuthEndpoint =
        url.pathname.endsWith('/api/auth/login') ||
        url.pathname.endsWith('/api/auth/logout')

      if (response.status === 401 && !isAuthEndpoint && !loggingOut) {
        loggingOut = true
        try {
          await originalFetch('/api/auth/logout', { method: 'POST' })
          await refreshSession()
          await navigateTo(LINKS.LOGIN)
          showError('Twoja sesja wygasła. Zaloguj się ponownie.')
        } finally {
          loggingOut = false
        }
      }
    },
  }) as typeof $fetch
})
