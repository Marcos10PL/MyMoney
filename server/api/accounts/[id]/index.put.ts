import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { accounts } from '~~/server/db/schema'
import { idParamSchema } from '~~/server/schema/query'
import { updateAccountBodySchema } from '~~/server/schema/body'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
  const body = await readValidatedBody(event, updateAccountBodySchema.parse)

  const [account] = await db
    .update(accounts)
    .set({
      bankId: body.bankId,
      name: body.name,
      description: body.description,
      type: body.type,
      percentage:
        body.percentage !== undefined ? String(body.percentage) : undefined,
      isFree: body.isFree,
      conditions: body.conditions,
      startDate: new Date(body.startDate),
      duration: body.duration,
      durationEndDate: body.durationEndDate
        ? new Date(body.durationEndDate)
        : undefined,
      isActive: body.isActive,
    })
    .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)))
    .returning()

  if (!account) {
    throw createError({ statusCode: 404, message: 'Account not found' })
  }

  return {
    success: true,
    message: 'Account updated successfully',
  } satisfies APIResponse
})
