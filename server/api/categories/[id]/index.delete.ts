import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { categories } from '~~/server/db/schema'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)

  const [category] = await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, user.id)))
    .returning()

  if (!category)
    throw createError({ statusCode: 404, message: 'Category not found' })

  return {
    success: true,
    message: 'Category deleted successfully',
  } satisfies APIResponse
})
