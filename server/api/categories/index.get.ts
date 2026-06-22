import { eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { categories } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)

  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, user.id))
    .orderBy(categories.createdAt)

  return {
    success: true,
    message: 'Categories fetched successfully',
    data: result.map((categories) => mapCategoryToDTO(categories)),
  } satisfies APIResponse<Category[]>
})
