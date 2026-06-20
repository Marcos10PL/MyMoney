import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { banks } from '~~/server/db/schema'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)

  const [bank] = await db
    .delete(banks)
    .where(and(eq(banks.id, id), eq(banks.userId, user.id)))
    .returning()

  if (!bank) throw createError({ statusCode: 404, message: 'Bank not found' })

  return {
    success: true,
    message: 'Bank deleted successfully',
  } satisfies APIResponse
})
