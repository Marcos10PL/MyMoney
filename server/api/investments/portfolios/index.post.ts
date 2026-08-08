import { db } from '~~/server/db/conn'
import { portfolios } from '~~/server/db/schema'
import { createPortfolioBodySchema } from '~~/server/schema/body'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const body = await readValidatedBody(event, createPortfolioBodySchema.parse)

  const [inserted] = await db
    .insert(portfolios)
    .values({
      userId: user.id,
      name: body.name,
      description: body.description ?? null,
    })
    .returning()

  if (!inserted) {
    throw createError({
      statusCode: 500,
      message: 'Failed to create portfolio',
    })
  }

  return {
    success: true,
    message: 'Portfolio created successfully',
    data: mapPortfolioToDTO(inserted, []),
  } satisfies APIResponse<Portfolio>
})
