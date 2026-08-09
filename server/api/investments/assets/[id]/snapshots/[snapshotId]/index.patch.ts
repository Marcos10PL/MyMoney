import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { assetSnapshots, assets } from '~~/server/db/schema'
import { assetSnapshotBodySchema } from '~~/server/schema/body'
import { assetSnapshotParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id, snapshotId } = await getValidatedRouterParams(
    event,
    assetSnapshotParamSchema.parse
  )
  const body = await readValidatedBody(event, assetSnapshotBodySchema.parse)

  const [asset] = await db
    .select()
    .from(assets)
    .where(and(eq(assets.id, id), eq(assets.userId, user.id)))
    .limit(1)

  if (!asset) throw createError({ statusCode: 404, message: 'Asset not found' })

  const [updated] = await db
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

  return { success: true, message: 'Snapshot updated' } satisfies APIResponse
})
