import { and, eq, ne } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { categories } from '~~/server/db/schema'
import { updateCategoryBodySchema } from '~~/server/schema/body'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
  const body = await readValidatedBody(event, updateCategoryBodySchema.parse)

  const [existingCategory] = await db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.userId, user.id),
        eq(categories.name, body.name),
        ne(categories.id, id)
      )
    )

  if (existingCategory)
    throw createError({
      statusCode: 409,
      message: 'Category with this name already exists',
    })

  const [category] = await db
    .update(categories)
    .set({
      parentId: body.parentId ?? null,
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
    data: mapCategoryToDTO(category),
  } satisfies APIResponse<Category>
})
