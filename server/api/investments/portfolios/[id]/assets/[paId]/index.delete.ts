import { eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { portfolioAssets } from '~~/server/db/schema'
import { portfolioAssetParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id: portfolioId, paId } = await getValidatedRouterParams(
    event,
    portfolioAssetParamSchema.parse
  )

  await requirePortfolio(portfolioId, user.id)
  await requirePortfolioAsset(paId, portfolioId)

  await db.delete(portfolioAssets).where(eq(portfolioAssets.id, paId))

  return {
    success: true,
    message: 'Asset removed from portfolio',
    data: null,
  } satisfies APIResponse<null>
})
