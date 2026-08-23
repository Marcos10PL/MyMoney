import { and, eq, inArray, isNotNull } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import {
  assetAccounts,
  assetSnapshots,
  assets,
  portfolioAssets,
  transactions,
} from '~~/server/db/schema'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id: portfolioId } = await getValidatedRouterParams(
    event,
    idParamSchema.parse
  )

  await requirePortfolio(portfolioId, user.id)

  const paRows = await db
    .select()
    .from(portfolioAssets)
    .leftJoin(assets, eq(portfolioAssets.assetId, assets.id))
    .where(eq(portfolioAssets.portfolioId, portfolioId))

  const assetIds = paRows.flatMap((r) => (r.assets ? [r.assets.id] : []))

  if (assetIds.length === 0) {
    return {
      success: true,
      message: 'No assets in portfolio',
      data: { snapshots: [], transactions: [] },
    } satisfies APIResponse<AssetPerformanceData>
  }

  const [assetAccountLinks, accountBalances, costBasisByAsset] =
    await Promise.all([
      db
        .select()
        .from(assetAccounts)
        .where(inArray(assetAccounts.assetId, assetIds)),
      computeAccountBalances(user.id),
      getAssetsCostBasis(assetIds, user.id),
    ])

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
    currentValueByAsset.set(asset.id, manual > 0 ? manual : accountsSum)
  }

  const allExplicitAllocs = await db
    .select({
      assetId: portfolioAssets.assetId,
      allocatedAmount: portfolioAssets.allocatedAmount,
      allocationMode: portfolioAssets.allocationMode,
    })
    .from(portfolioAssets)
    .where(
      and(
        inArray(portfolioAssets.assetId, assetIds),
        isNotNull(portfolioAssets.allocatedAmount)
      )
    )

  const totalExplicitByAsset = new Map<string, number>()
  for (const r of allExplicitAllocs) {
    if (!r.allocatedAmount) continue
    const valueEquivalent = toValueEquivalent(
      parseFloat(r.allocatedAmount),
      r.allocationMode,
      costBasisByAsset.get(r.assetId) ?? 0,
      currentValueByAsset.get(r.assetId) ?? 0
    )
    totalExplicitByAsset.set(
      r.assetId,
      (totalExplicitByAsset.get(r.assetId) ?? 0) + valueEquivalent
    )
  }

  const proportionByAsset = new Map<string, number>()
  for (const { portfolio_assets: pa, assets: asset } of paRows) {
    if (!asset) continue
    const currentValue = currentValueByAsset.get(asset.id) ?? 0
    const remaining = Math.max(
      0,
      currentValue - (totalExplicitByAsset.get(asset.id) ?? 0)
    )
    const effective =
      pa.allocatedAmount !== null
        ? toValueEquivalent(
            parseFloat(pa.allocatedAmount) || 0,
            pa.allocationMode,
            costBasisByAsset.get(asset.id) ?? 0,
            currentValue
          )
        : remaining
    const proportion = currentValue > 0 ? effective / currentValue : 1
    proportionByAsset.set(asset.id, proportion)
  }

  const [allSnaps, allTxs] = await Promise.all([
    db
      .select()
      .from(assetSnapshots)
      .where(inArray(assetSnapshots.assetId, assetIds))
      .orderBy(assetSnapshots.date),
    db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.id),
          isNotNull(transactions.assetId),
          inArray(transactions.assetId, assetIds)
        )
      )
      .orderBy(transactions.date),
  ])

  const snapshotsByAsset = new Map<
    string,
    Array<{ date: string; value: number }>
  >()
  for (const s of allSnaps) {
    const list = snapshotsByAsset.get(s.assetId) ?? []
    list.push({ date: s.date, value: parseFloat(s.value) })
    snapshotsByAsset.set(s.assetId, list)
  }

  const getValueAt = (assetId: string, date: string): number | null => {
    const snaps = snapshotsByAsset.get(assetId)
    if (!snaps) return null
    let val: number | null = null
    for (const s of snaps) {
      if (s.date <= date) val = s.value
      else break
    }
    return val
  }

  const allDates = [...new Set(allSnaps.map((s) => s.date))].sort()
  const mergedSnapshots: { date: string; value: number }[] = []

  for (const date of allDates) {
    let total = 0
    let hasAny = false
    for (const assetId of assetIds) {
      const val = getValueAt(assetId, date)
      if (val !== null) {
        total += (proportionByAsset.get(assetId) ?? 0) * val
        hasAny = true
      }
    }
    if (hasAny) {
      mergedSnapshots.push({ date, value: Math.round(total * 100) / 100 })
    }
  }

  const mergedTxs = allTxs
    .filter(
      (t) =>
        t.type === TRANSACTION_TYPES.INVESTMENT_BUY ||
        t.type === TRANSACTION_TYPES.INVESTMENT_SELL
    )
    .map((t) => ({
      date:
        typeof t.date === 'string' ? t.date : t.date.toISOString().slice(0, 10),
      type: t.type,
      amount:
        Math.round(
          parseFloat(t.amount) *
            (proportionByAsset.get(t.assetId ?? '') ?? 0) *
            100
        ) / 100,
    }))
    .filter((t) => t.amount > 0)

  return {
    success: true,
    message: 'Portfolio performance fetched successfully',
    data: { snapshots: mergedSnapshots, transactions: mergedTxs },
  } satisfies APIResponse<AssetPerformanceData>
})
