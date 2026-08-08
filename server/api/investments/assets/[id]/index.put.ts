import { and, eq, inArray } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { accounts, assetAccounts, assets, banks } from '~~/server/db/schema'
import { updateAssetBodySchema } from '~~/server/schema/body'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
  const body = await readValidatedBody(event, updateAssetBodySchema.parse)

  const [existing] = await db
    .select()
    .from(assets)
    .where(and(eq(assets.id, id), eq(assets.userId, user.id)))
    .limit(1)

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Asset not found' })
  }

  const linkedAccounts: Array<AppAccount & { bankName: string | null }> = []
  if (body.accountIds.length > 0) {
    const found = await db
      .select({ account: accounts, bankName: banks.name })
      .from(accounts)
      .leftJoin(banks, eq(accounts.bankId, banks.id))
      .where(inArray(accounts.id, body.accountIds))

    for (const { account, bankName } of found) {
      if (account.userId !== user.id) {
        throw createError({
          statusCode: 403,
          message: 'Access denied to account',
        })
      }
      linkedAccounts.push({ ...account, bankName: bankName ?? null })
    }
  }

  const [updated] = await db
    .update(assets)
    .set({
      name: body.name,
      type: body.type,
      value: String(body.value),
      currency: body.currency,
      description: body.description ?? null,
    })
    .where(eq(assets.id, id))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 500, message: 'Failed to update asset' })
  }

  await db.delete(assetAccounts).where(eq(assetAccounts.assetId, id))
  if (linkedAccounts.length > 0) {
    await db
      .insert(assetAccounts)
      .values(linkedAccounts.map((acc) => ({ assetId: id, accountId: acc.id })))
  }

  const accountBalances =
    linkedAccounts.length > 0 ? await computeAccountBalances(user.id) : {}

  return {
    success: true,
    message: 'Asset updated successfully',
    data: mapAssetToDTO(updated, linkedAccounts, accountBalances),
  } satisfies APIResponse<Asset>
})
