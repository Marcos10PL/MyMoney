import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { portfolioAssets, portfolios } from '~~/server/db/schema'
import { portfolioAssetParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id: portfolioId, paId } = await getValidatedRouterParams(
    event,
    portfolioAssetParamSchema.parse
  )

  const [portfolio] = await db
    .select()
    .from(portfolios)
    .where(and(eq(portfolios.id, portfolioId), eq(portfolios.userId, user.id)))
    .limit(1)

  if (!portfolio) {
    throw createError({ statusCode: 404, message: 'Portfolio not found' })
  }

  const [pa] = await db
    .select()
    .from(portfolioAssets)
    .where(
      and(
        eq(portfolioAssets.id, paId),
        eq(portfolioAssets.portfolioId, portfolioId)
      )
    )
    .limit(1)

  if (!pa) {
    throw createError({ statusCode: 404, message: 'Portfolio asset not found' })
  }

  await db.delete(portfolioAssets).where(eq(portfolioAssets.id, paId))

  return {
    success: true,
    message: 'Asset removed from portfolio',
    data: null,
  } satisfies APIResponse<null>
})
