import { asc, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { assetSnapshots } from '~~/server/db/schema'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)

  await requireAsset(id, user.id)

  const rows = await db
    .select({
      id: assetSnapshots.id,
      date: assetSnapshots.date,
      value: assetSnapshots.value,
    })
    .from(assetSnapshots)
    .where(eq(assetSnapshots.assetId, id))
    .orderBy(asc(assetSnapshots.date))

  const snapshots: AssetSnapshot[] = rows.map((row, i) => {
    const value = parseFloat(row.value)
    const prev = i > 0 ? parseFloat(rows[i - 1]!.value) : null
    const first = i > 0 ? parseFloat(rows[0]!.value) : null
    const vsFirst = first !== null ? value - first : null
    const vsPrev = prev !== null ? value - prev : null
    return {
      id: row.id,
      date: row.date,
      value,
      vsPrev,
      vsPrevPercent: prev !== null && prev > 0 ? (vsPrev! / prev) * 100 : null,
      vsFirst,
      vsFirstPercent:
        first !== null && first > 0 ? (vsFirst! / first) * 100 : null,
    }
  })

  return {
    success: true,
    message: 'Snapshots fetched successfully',
    data: snapshots,
  } satisfies APIResponse<AssetSnapshot[]>
})
