import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { assets, portfolioAssets, portfolios } from '~~/server/db/schema'

export const requireAsset = async (
  id: string,
  userId: string
): Promise<AppAsset> => {
  const [asset] = await db
    .select()
    .from(assets)
    .where(and(eq(assets.id, id), eq(assets.userId, userId)))
    .limit(1)

  if (!asset) throw createError({ statusCode: 404, message: 'Asset not found' })
  return asset
}

export const requirePortfolio = async (
  id: string,
  userId: string
): Promise<AppPortfolio> => {
  const [portfolio] = await db
    .select()
    .from(portfolios)
    .where(and(eq(portfolios.id, id), eq(portfolios.userId, userId)))
    .limit(1)

  if (!portfolio)
    throw createError({ statusCode: 404, message: 'Portfolio not found' })
  return portfolio
}

export const requirePortfolioAsset = async (
  paId: string,
  portfolioId: string
): Promise<AppPortfolioAsset> => {
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

  if (!pa)
    throw createError({
      statusCode: 404,
      message: 'Portfolio asset not found',
    })
  return pa
}
