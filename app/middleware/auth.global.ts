export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  const isLoginPage = to.path.endsWith(LINKS.LOGIN)

  if (!loggedIn.value && !isLoginPage) {
    return navigateTo(LINKS.LOGIN)
  }

  if (loggedIn.value && isLoginPage) {
    return navigateTo(LINKS.DASHBOARD)
  }
})
