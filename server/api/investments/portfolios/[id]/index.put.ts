import { eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { portfolios } from '~~/server/db/schema'
import { updatePortfolioBodySchema } from '~~/server/schema/body'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
  const body = await readValidatedBody(event, updatePortfolioBodySchema.parse)

  await requirePortfolio(id, user.id)

  const [updated] = await db
    .update(portfolios)
    .set({ name: body.name, description: body.description ?? null })
    .where(eq(portfolios.id, id))
    .returning()

  if (!updated) {
    throw createError({
      statusCode: 500,
      message: 'Failed to update portfolio',
    })
  }

  return {
    success: true,
    message: 'Portfolio updated successfully',
    data: mapPortfolioToDTO(updated, []),
  } satisfies APIResponse<Portfolio>
})
