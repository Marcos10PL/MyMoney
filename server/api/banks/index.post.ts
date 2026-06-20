import { db } from '~~/server/db/conn'
import { banks } from '~~/server/db/schema'
import { createBankBodySchema } from '~~/server/schema/body'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const body = await readValidatedBody(event, createBankBodySchema.parse)

  await db.insert(banks).values({ userId: user.id, name: body.name })

  return {
    success: true,
    message: 'Bank created successfully',
  } satisfies APIResponse
})
