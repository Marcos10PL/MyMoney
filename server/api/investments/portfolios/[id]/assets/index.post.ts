import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { portfolioAssets } from '~~/server/db/schema'
import { addPortfolioAssetBodySchema } from '~~/server/schema/body'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id: portfolioId } = await getValidatedRouterParams(
    event,
    idParamSchema.parse
  )
  const body = await readValidatedBody(event, addPortfolioAssetBodySchema.parse)

  await requirePortfolio(portfolioId, user.id)
  await requireAsset(body.assetId, user.id)

  const [existing] = await db
    .select()
    .from(portfolioAssets)
    .where(
      and(
        eq(portfolioAssets.portfolioId, portfolioId),
        eq(portfolioAssets.assetId, body.assetId)
      )
    )
    .limit(1)

  if (existing) {
    throw createError({
      statusCode: 409,
      message: 'Asset already in portfolio',
    })
  }

  await validateAllocation(body.assetId, body.allocatedAmount ?? null, user.id)
  await validateGainWeight(body.assetId, body.gainWeight ?? null)

  await db.insert(portfolioAssets).values({
    portfolioId,
    assetId: body.assetId,
    allocatedAmount:
      body.allocatedAmount != null ? String(body.allocatedAmount) : null,
    targetPercent:
      body.targetPercent != null ? String(body.targetPercent) : null,
    maxDeviation: body.maxDeviation != null ? String(body.maxDeviation) : null,
    gainWeight: body.gainWeight != null ? String(body.gainWeight) : null,
  })

  return {
    success: true,
    message: 'Asset added to portfolio',
    data: null,
  } satisfies APIResponse<null>
})
