import { eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { categories } from '~~/server/db/schema'

export const listCategories = async (userId: string): Promise<Category[]> => {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.createdAt)

  return result.map((categories) => mapCategoryToDTO(categories))
}
