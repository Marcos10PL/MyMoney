import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import {
  assetAccounts,
  assets,
  portfolioAssets,
  portfolios,
} from '~~/server/db/schema'
import { addPortfolioAssetBodySchema } from '~~/server/schema/body'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id: portfolioId } = await getValidatedRouterParams(
    event,
    idParamSchema.parse
  )
  const body = await readValidatedBody(event, addPortfolioAssetBodySchema.parse)

  const [portfolio] = await db
    .select()
    .from(portfolios)
    .where(and(eq(portfolios.id, portfolioId), eq(portfolios.userId, user.id)))
    .limit(1)

  if (!portfolio) {
    throw createError({ statusCode: 404, message: 'Portfolio not found' })
  }

  const [asset] = await db
    .select()
    .from(assets)
    .where(and(eq(assets.id, body.assetId), eq(assets.userId, user.id)))
    .limit(1)

  if (!asset) {
    throw createError({ statusCode: 404, message: 'Asset not found' })
  }

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

  if (body.allocatedAmount == null) {
    const [existingNull] = await db
      .select()
      .from(portfolioAssets)
      .where(
        and(
          eq(portfolioAssets.assetId, body.assetId),
          isNull(portfolioAssets.allocatedAmount)
        )
      )
      .limit(1)

    if (existingNull) {
      throw createError({
        statusCode: 422,
        message: 'Asset already has an unallocated entry in another portfolio',
      })
    }
  }

  if (body.allocatedAmount != null) {
    const linkedAccounts = await db
      .select({ accountId: assetAccounts.accountId })
      .from(assetAccounts)
      .where(eq(assetAccounts.assetId, body.assetId))

    let currentValue: number
    if (linkedAccounts.length > 0) {
      const balances = await computeAccountBalances(user.id)
      currentValue = linkedAccounts.reduce(
        (sum, { accountId }) => sum + (balances[accountId] ?? 0),
        0
      )
    } else {
      currentValue = parseFloat(asset.value) || 0
    }

    const sumResult = await db
      .select({
        existingSum: sql<string>`coalesce(sum(${portfolioAssets.allocatedAmount}), '0')`,
      })
      .from(portfolioAssets)
      .where(
        and(
          eq(portfolioAssets.assetId, body.assetId),
          isNotNull(portfolioAssets.allocatedAmount)
        )
      )

    const existingAllocated = parseFloat(sumResult[0]?.existingSum ?? '0')
    if (existingAllocated + body.allocatedAmount > currentValue + 0.005) {
      throw createError({
        statusCode: 422,
        message: 'Allocated amount exceeds asset value',
      })
    }
  }

  await db.insert(portfolioAssets).values({
    portfolioId,
    assetId: body.assetId,
    allocatedAmount:
      body.allocatedAmount != null ? String(body.allocatedAmount) : null,
    targetPercent:
      body.targetPercent != null ? String(body.targetPercent) : null,
    maxDeviation: body.maxDeviation != null ? String(body.maxDeviation) : null,
  })

  return {
    success: true,
    message: 'Asset added to portfolio',
    data: null,
  } satisfies APIResponse<null>
})
