import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { assets } from '~~/server/db/schema'
import { assetSnapshotBodySchema } from '~~/server/schema/body'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
  const body = await readValidatedBody(event, assetSnapshotBodySchema.parse)

  const [asset] = await db
    .select()
    .from(assets)
    .where(and(eq(assets.id, id), eq(assets.userId, user.id)))
    .limit(1)

  if (!asset) throw createError({ statusCode: 404, message: 'Asset not found' })

  const date = body.date ?? new Date().toISOString().split('T')[0]!

  await Promise.all([
    db.update(assets).set({ value: String(body.value) }).where(eq(assets.id, id)),
    upsertAssetSnapshot(id, body.value, date),
  ])

  return { success: true, message: 'Snapshot saved' } satisfies APIResponse
})
