import { eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { portfolios } from '~~/server/db/schema'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)

  await requirePortfolio(id, user.id)

  await db.delete(portfolios).where(eq(portfolios.id, id))

  return {
    success: true,
    message: 'Portfolio deleted successfully',
    data: null,
  } satisfies APIResponse<null>
})
