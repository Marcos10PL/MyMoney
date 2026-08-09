import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { assetSnapshots } from '~~/server/db/schema'
import { assetSnapshotBodySchema } from '~~/server/schema/body'
import { assetSnapshotParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id, snapshotId } = await getValidatedRouterParams(
    event,
    assetSnapshotParamSchema.parse
  )
  const body = await readValidatedBody(event, assetSnapshotBodySchema.parse)

  await requireAsset(id, user.id)

  await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(assetSnapshots)
      .set({
        value: String(body.value),
        ...(body.date ? { date: body.date } : {}),
      })
      .where(
        and(eq(assetSnapshots.id, snapshotId), eq(assetSnapshots.assetId, id))
      )
      .returning()

    if (!updated)
      throw createError({ statusCode: 404, message: 'Snapshot not found' })

    await syncAssetValue(id, tx)
  })

  return { success: true, message: 'Snapshot updated' } satisfies APIResponse
})
