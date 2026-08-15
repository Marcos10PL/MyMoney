export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const data = await listAccounts(user.id)

  return {
    success: true,
    message: 'Accounts fetched successfully',
    data,
  } satisfies APIResponse<Account[]>
})
