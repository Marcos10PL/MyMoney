import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { portfolios } from '~~/server/db/schema'
import { updatePortfolioBodySchema } from '~~/server/schema/body'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
  const body = await readValidatedBody(event, updatePortfolioBodySchema.parse)

  const [existing] = await db
    .select()
    .from(portfolios)
    .where(and(eq(portfolios.id, id), eq(portfolios.userId, user.id)))
    .limit(1)

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Portfolio not found' })
  }

  const [updated] = await db
    .update(portfolios)
    .set({ name: body.name, description: body.description ?? null })
    .where(eq(portfolios.id, id))
    .returning()

  if (!updated) {
    throw createError({
      statusCode: 500,
      message: 'Failed to update portfolio',
    })
  }

  return {
    success: true,
    message: 'Portfolio updated successfully',
    data: mapPortfolioToDTO(updated, []),
  } satisfies APIResponse<Portfolio>
})
