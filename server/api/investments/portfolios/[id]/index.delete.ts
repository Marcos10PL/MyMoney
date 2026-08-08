import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { portfolios } from '~~/server/db/schema'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)

  const [existing] = await db
    .select()
    .from(portfolios)
    .where(and(eq(portfolios.id, id), eq(portfolios.userId, user.id)))
    .limit(1)

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Portfolio not found' })
  }

  await db.delete(portfolios).where(eq(portfolios.id, id))

  return {
    success: true,
    message: 'Portfolio deleted successfully',
    data: null,
  } satisfies APIResponse<null>
})
