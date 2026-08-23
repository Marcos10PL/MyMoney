import { eq, inArray } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { accounts, assetAccounts, assets, banks } from '~~/server/db/schema'

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

  const costBasisMap = await getAssetsCostBasis(
    userAssets.map((a) => a.id),
    user.id
  )

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
