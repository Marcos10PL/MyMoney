import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { categories } from '~~/server/db/schema'
import { updateCategoryBodySchema } from '~~/server/schema/body'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
  const body = await readValidatedBody(event, updateCategoryBodySchema.parse)

  const [category] = await db
    .update(categories)
    .set({
      parentId: body.parentId,
      name: body.name,
      type: body.type,
    })
    .where(and(eq(categories.id, id), eq(categories.userId, user.id)))
    .returning()

  if (!category)
    throw createError({ statusCode: 404, message: 'Category not found' })

  return {
    success: true,
    message: 'Category updated successfully',
  } satisfies APIResponse
})
