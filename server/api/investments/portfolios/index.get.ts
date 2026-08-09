import { and, eq, inArray, isNotNull, sql } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import {
  assetAccounts,
  assets,
  portfolioAssets,
  portfolios,
  transactions,
} from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)

  const userPortfolios = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.userId, user.id))
    .orderBy(portfolios.createdAt)

  if (userPortfolios.length === 0) {
    return {
      success: true,
      message: 'Portfolios fetched successfully',
      data: [] as Portfolio[],
    } satisfies APIResponse<Portfolio[]>
  }

  const portfolioIds = userPortfolios.map((p) => p.id)

  const paRows = await db
    .select()
    .from(portfolioAssets)
    .leftJoin(assets, eq(portfolioAssets.assetId, assets.id))
    .where(inArray(portfolioAssets.portfolioId, portfolioIds))

  const assetIds = paRows.flatMap((r) => (r.assets ? [r.assets.id] : []))

  const [assetAccountLinks, accountBalances, costBasisRows] = await Promise.all(
    [
      assetIds.length > 0
        ? db
            .select()
            .from(assetAccounts)
            .where(inArray(assetAccounts.assetId, assetIds))
        : Promise.resolve([]),
      computeAccountBalances(user.id),
      assetIds.length > 0
        ? db
            .select({
              assetId: transactions.assetId,
              costBasis: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'investment_buy' THEN ${transactions.amount}::numeric ELSE -${transactions.amount}::numeric END), 0)`,
            })
            .from(transactions)
            .where(
              and(
                eq(transactions.userId, user.id),
                isNotNull(transactions.assetId),
                inArray(transactions.assetId, assetIds)
              )
            )
            .groupBy(transactions.assetId)
        : Promise.resolve([]),
    ]
  )

  const costBasisByAsset = new Map<string, number>()
  for (const row of costBasisRows) {
    if (row.assetId)
      costBasisByAsset.set(row.assetId, parseFloat(row.costBasis))
  }

  const linkedAccountIdsByAsset = new Map<string, string[]>()
  for (const link of assetAccountLinks) {
    const list = linkedAccountIdsByAsset.get(link.assetId) ?? []
    list.push(link.accountId)
    linkedAccountIdsByAsset.set(link.assetId, list)
  }

  const currentValueByAsset = new Map<string, number>()
  for (const { assets: asset } of paRows) {
    if (!asset || currentValueByAsset.has(asset.id)) continue
    const manual = parseFloat(asset.value) || 0
    const linkedIds = linkedAccountIdsByAsset.get(asset.id) ?? []
    const accountsSum = linkedIds.reduce(
      (sum, aid) => sum + (accountBalances[aid] ?? 0),
      0
    )
    const currentValue = manual > 0 ? manual : accountsSum
    currentValueByAsset.set(asset.id, currentValue)
  }

  const explicitAllocByAsset = new Map<string, number>()
  for (const { portfolio_assets: pa } of paRows) {
    if (pa.allocatedAmount == null) continue
    explicitAllocByAsset.set(
      pa.assetId,
      (explicitAllocByAsset.get(pa.assetId) ?? 0) +
        parseFloat(pa.allocatedAmount)
    )
  }

  const paByPortfolio = new Map<
    string,
    Array<{
      pa: AppPortfolioAsset
      asset: AppAsset
      currentValue: number
      remainingValue: number
      costBasis: number
    }>
  >()

  for (const { portfolio_assets: pa, assets: asset } of paRows) {
    if (!asset) continue
    const currentValue = currentValueByAsset.get(asset.id) ?? 0
    const remainingValue = Math.max(
      0,
      currentValue - (explicitAllocByAsset.get(asset.id) ?? 0)
    )
    const costBasis = costBasisByAsset.get(asset.id) ?? 0
    const list = paByPortfolio.get(pa.portfolioId) ?? []
    list.push({ pa, asset, currentValue, remainingValue, costBasis })
    paByPortfolio.set(pa.portfolioId, list)
  }

  return {
    success: true,
    message: 'Portfolios fetched successfully',
    data: userPortfolios.map((portfolio) =>
      mapPortfolioToDTO(portfolio, paByPortfolio.get(portfolio.id) ?? [])
    ),
  } satisfies APIResponse<Portfolio[]>
})
