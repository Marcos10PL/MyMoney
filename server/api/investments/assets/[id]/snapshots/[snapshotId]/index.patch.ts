import { and, desc, eq } from 'drizzle-orm'
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

    const [latest] = await tx
      .select({ value: assetSnapshots.value })
      .from(assetSnapshots)
      .where(eq(assetSnapshots.assetId, id))
      .orderBy(desc(assetSnapshots.date))
      .limit(1)

    await tx
      .update(assets)
      .set({ value: latest?.value ?? '0' })
      .where(eq(assets.id, id))
  })

  return { success: true, message: 'Snapshot updated' } satisfies APIResponse
})
