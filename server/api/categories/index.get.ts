export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const data = await listCategories(user.id)

  return {
    success: true,
    message: 'Categories fetched successfully',
    data,
  } satisfies APIResponse<Category[]>
})
