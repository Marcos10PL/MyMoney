import { db } from '~~/server/db/conn'
import { categories } from '~~/server/db/schema'
import { createCategoryBodySchema } from '~~/server/schema/body'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const body = await readValidatedBody(event, createCategoryBodySchema.parse)

  await db.insert(categories).values({
    userId: user.id,
    parentId: body.parentId,
    name: body.name,
    type: body.type,
  })

  return {
    success: true,
    message: 'Category created successfully',
  } satisfies APIResponse
})
