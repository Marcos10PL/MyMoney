import { and, eq } from 'drizzle-orm/sql/expressions/conditions'
import { db } from '~~/server/db/conn'
import { banks } from '~~/server/db/schema'
import { createBankBodySchema } from '~~/server/schema/body'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const body = await readValidatedBody(event, createBankBodySchema.parse)

  const [existingBank] = await db
    .select()
    .from(banks)
    .where(and(eq(banks.userId, user.id), eq(banks.name, body.name)))

  if (existingBank)
    throw createError({
      statusCode: 409,
      message: 'Bank with this name already exists',
    })

  const [bank] = await db
    .insert(banks)
    .values({ userId: user.id, name: body.name })
    .returning()

  if (!bank)
    throw createError({ statusCode: 500, message: 'Failed to create bank' })

  return {
    success: true,
    message: 'Bank created successfully',
    data: mapBankToDTO(bank),
  } satisfies APIResponse<Bank>
})
