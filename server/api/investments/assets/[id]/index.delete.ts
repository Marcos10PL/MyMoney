import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { assets } from '~~/server/db/schema'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)

  const [existing] = await db
    .select()
    .from(assets)
    .where(and(eq(assets.id, id), eq(assets.userId, user.id)))
    .limit(1)

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Asset not found' })
  }

  await db.delete(assets).where(eq(assets.id, id))

  return {
    success: true,
    message: 'Asset deleted successfully',
    data: null,
  } satisfies APIResponse<null>
})
