export default defineEventHandler(async (event) => {
  const isApi = event.path.startsWith('/api')

  const isAuthAction =
    event.path.startsWith('/api/auth') ||
    event.path.startsWith('/api/_') ||
    event.path.startsWith('/api/public')

  if (isApi && !isAuthAction) {
    const session = await getUserSession(event)

    if (!session || !session?.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }

    event.context.userSession = session
  }
})
