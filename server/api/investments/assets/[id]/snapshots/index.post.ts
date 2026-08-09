import { db } from '~~/server/db/conn'
import { assetSnapshotBodySchema } from '~~/server/schema/body'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
  const body = await readValidatedBody(event, assetSnapshotBodySchema.parse)

  await requireAsset(id, user.id)

  const date = body.date ?? new Date().toISOString().split('T')[0]!

  await db.transaction(async (tx) => {
    await upsertAssetSnapshot(id, body.value, date, tx)
    await syncAssetValue(id, tx)
  })

  return { success: true, message: 'Snapshot saved' } satisfies APIResponse
})
