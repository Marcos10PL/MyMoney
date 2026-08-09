import { and, eq, inArray, isNotNull, sql } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import {
  accounts,
  assetAccounts,
  assets,
  banks,
  transactions,
} from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)

  const [userAssets, accountBalances] = await Promise.all([
    db
      .select()
      .from(assets)
      .where(eq(assets.userId, user.id))
      .orderBy(assets.createdAt),
    computeAccountBalances(user.id),
  ])

  const accountsByAsset = new Map<
    string,
    Array<AppAccount & { bankName: string | null }>
  >()

  if (userAssets.length > 0) {
    const links = await db
      .select({
        assetId: assetAccounts.assetId,
        account: accounts,
        bankName: banks.name,
      })
      .from(assetAccounts)
      .innerJoin(accounts, eq(assetAccounts.accountId, accounts.id))
      .leftJoin(banks, eq(accounts.bankId, banks.id))
      .where(
        inArray(
          assetAccounts.assetId,
          userAssets.map((a) => a.id)
        )
      )

    for (const { assetId, account, bankName } of links) {
      if (!account) continue
      const list = accountsByAsset.get(assetId) ?? []
      list.push({ ...account, bankName: bankName ?? null })
      accountsByAsset.set(assetId, list)
    }
  }

  const costBasisMap = new Map<string, number>()
  if (userAssets.length > 0) {
    const assetIds = userAssets.map((a) => a.id)
    const purchaseSums = await db
      .select({
        assetId: transactions.assetId,
        buySum: sql<string>`coalesce(sum(case when ${transactions.type} = 'investment_buy' then ${transactions.amount}::numeric else 0 end), 0)`,
        sellSum: sql<string>`coalesce(sum(case when ${transactions.type} = 'investment_sell' then ${transactions.amount}::numeric else 0 end), 0)`,
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

    for (const row of purchaseSums) {
      if (!row.assetId) continue
      costBasisMap.set(
        row.assetId,
        parseFloat(row.buySum) - parseFloat(row.sellSum)
      )
    }
  }

  return {
    success: true,
    message: 'Assets fetched successfully',
    data: userAssets.map((asset) =>
      mapAssetToDTO(
        asset,
        accountsByAsset.get(asset.id) ?? [],
        accountBalances,
        costBasisMap.get(asset.id) ?? 0
      )
    ),
  } satisfies APIResponse<Asset[]>
})
