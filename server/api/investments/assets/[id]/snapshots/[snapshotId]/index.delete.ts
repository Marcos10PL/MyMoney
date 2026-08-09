import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { assetSnapshots } from '~~/server/db/schema'
import { assetSnapshotParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id, snapshotId } = await getValidatedRouterParams(
    event,
    assetSnapshotParamSchema.parse
  )

  await requireAsset(id, user.id)

  await db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(assetSnapshots)
      .where(
        and(eq(assetSnapshots.id, snapshotId), eq(assetSnapshots.assetId, id))
      )
      .returning()

    if (!deleted)
      throw createError({ statusCode: 404, message: 'Snapshot not found' })

    await syncAssetValue(id, tx)
  })

  return { success: true, message: 'Snapshot deleted' } satisfies APIResponse
})
