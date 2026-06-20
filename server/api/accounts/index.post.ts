import { db } from '~~/server/db/conn'
import { accounts } from '~~/server/db/schema'
import { createAccountBodySchema } from '~~/server/schema/body'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const body = await readValidatedBody(event, createAccountBodySchema.parse)

  await db.insert(accounts).values({
    userId: user.id,
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

  return {
    success: true,
    message: 'Account created successfully',
  } satisfies APIResponse
})
