import { alias } from 'drizzle-orm/pg-core'
import { eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { categories } from '~~/server/db/schema'

const parentCategories = alias(categories, 'parent_categories')

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)

  const result = await db
    .select({
      id: categories.id,
      parentId: categories.parentId,
      parent: { id: parentCategories.id, name: parentCategories.name },
      name: categories.name,
      type: categories.type,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
    })
    .from(categories)
    .leftJoin(parentCategories, eq(categories.parentId, parentCategories.id))
    .where(eq(categories.userId, user.id))

  return {
    success: true,
    message: 'Categories fetched successfully',
    data: result,
  } satisfies APIResponse<Category[]>
})
