import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { categories } from '~~/server/db/schema'
import { createCategoryBodySchema } from '~~/server/schema/body'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const body = await readValidatedBody(event, createCategoryBodySchema.parse)

  const [existingCategory] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, user.id), eq(categories.name, body.name)))

  if (existingCategory)
    throw createError({
      statusCode: 409,
      message: 'Category with this name already exists',
    })

  const [category] = await db
    .insert(categories)
    .values({
      userId: user.id,
      parentId: body.parentId ?? null,
      name: body.name,
      type: body.type,
    })
    .returning()

  if (!category)
    throw createError({ statusCode: 500, message: 'Failed to create category' })

  return {
    success: true,
    message: 'Category created successfully',
    data: mapCategoryToDTO(category),
  } satisfies APIResponse<Category>
})
