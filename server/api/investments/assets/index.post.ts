import { eq, inArray } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { accounts, assetAccounts, assets, banks } from '~~/server/db/schema'
import { createAssetBodySchema } from '~~/server/schema/body'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const body = await readValidatedBody(event, createAssetBodySchema.parse)

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

  const [inserted] = await db
    .insert(assets)
    .values({
      userId: user.id,
      name: body.name,
      type: body.type,
      value: String(body.value),
      currency: body.currency,
      description: body.description ?? null,
    })
    .returning()

  if (!inserted) {
    throw createError({ statusCode: 500, message: 'Failed to create asset' })
  }

  if (linkedAccounts.length > 0) {
    await db.insert(assetAccounts).values(
      linkedAccounts.map((acc) => ({
        assetId: inserted.id,
        accountId: acc.id,
      }))
    )
  }

  const accountBalances =
    linkedAccounts.length > 0 ? await computeAccountBalances(user.id) : {}

  return {
    success: true,
    message: 'Asset created successfully',
    data: mapAssetToDTO(inserted, linkedAccounts, accountBalances),
  } satisfies APIResponse<Asset>
})
