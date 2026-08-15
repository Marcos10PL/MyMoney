export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const data = await getDashboardStats(user.id)

  return {
    success: true,
    message: 'Dashboard data fetched successfully',
    data,
  } satisfies StatsResponse
})
