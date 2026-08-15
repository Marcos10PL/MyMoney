import { createTransactionBodySchema } from '~~/server/schema/body'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const body = await readValidatedBody(event, createTransactionBodySchema.parse)

  await createTransaction(user.id, body)

  return {
    success: true,
    message: 'Transaction created successfully',
  } satisfies APIResponse
})
