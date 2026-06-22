import { and, eq, ne } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { banks } from '~~/server/db/schema'
import { updateBankBodySchema } from '~~/server/schema/body'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
  const body = await readValidatedBody(event, updateBankBodySchema.parse)

  const [duplicate] = await db
    .select({ id: banks.id })
    .from(banks)
    .where(
      and(
        eq(banks.userId, user.id),
        eq(banks.name, body.name),
        ne(banks.id, id)
      )
    )

  if (duplicate)
    throw createError({
      statusCode: 409,
      message: 'Bank with this name already exists',
    })

  const [bank] = await db
    .update(banks)
    .set({ name: body.name })
    .where(and(eq(banks.id, id), eq(banks.userId, user.id)))
    .returning()

  if (!bank) throw createError({ statusCode: 404, message: 'Bank not found' })

  return {
    success: true,
    message: 'Bank updated successfully',
    data: mapBankToDTO(bank),
  } satisfies APIResponse<Bank>
})
