export default defineEventHandler(async (event) => {
  await clearUserSession(event)

  return { success: true, message: 'Logout successful' } satisfies APIResponse
})
