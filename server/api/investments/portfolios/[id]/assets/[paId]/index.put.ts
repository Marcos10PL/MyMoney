import { eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { portfolioAssets } from '~~/server/db/schema'
import { updatePortfolioAssetBodySchema } from '~~/server/schema/body'
import { portfolioAssetParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id: portfolioId, paId } = await getValidatedRouterParams(
    event,
    portfolioAssetParamSchema.parse
  )
  const body = await readValidatedBody(
    event,
    updatePortfolioAssetBodySchema.parse
  )

  await requirePortfolio(portfolioId, user.id)
  const pa = await requirePortfolioAsset(paId, portfolioId)

  await validateAllocation(
    pa.assetId,
    body.allocatedAmount ?? null,
    user.id,
    paId
  )

  await db
    .update(portfolioAssets)
    .set({
      allocatedAmount:
        body.allocatedAmount != null ? String(body.allocatedAmount) : null,
      targetPercent:
        body.targetPercent != null ? String(body.targetPercent) : null,
      maxDeviation:
        body.maxDeviation != null ? String(body.maxDeviation) : null,
    })
    .where(eq(portfolioAssets.id, paId))

  return {
    success: true,
    message: 'Portfolio asset updated successfully',
    data: null,
  } satisfies APIResponse<null>
})
