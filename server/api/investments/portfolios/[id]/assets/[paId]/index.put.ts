import { and, eq, isNotNull, isNull, ne, sql } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import {
  assetAccounts,
  assets,
  portfolioAssets,
  portfolios,
} from '~~/server/db/schema'
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

  if (body.allocatedAmount == null) {
    const [existingNull] = await db
      .select()
      .from(portfolioAssets)
      .where(
        and(
          eq(portfolioAssets.assetId, pa.assetId),
          isNull(portfolioAssets.allocatedAmount),
          ne(portfolioAssets.id, paId)
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
    const [asset] = await db
      .select()
      .from(assets)
      .where(and(eq(assets.id, pa.assetId), eq(assets.userId, user.id)))
      .limit(1)

    if (!asset) {
      throw createError({ statusCode: 404, message: 'Asset not found' })
    }

    const linkedAccounts = await db
      .select({ accountId: assetAccounts.accountId })
      .from(assetAccounts)
      .where(eq(assetAccounts.assetId, pa.assetId))

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
          eq(portfolioAssets.assetId, pa.assetId),
          isNotNull(portfolioAssets.allocatedAmount),
          ne(portfolioAssets.id, paId)
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
