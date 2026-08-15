import { updateTransactionBodySchema } from '~~/server/schema/body'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
  const body = await readValidatedBody(event, updateTransactionBodySchema.parse)

  await updateTransaction(user.id, id, body)

  return {
    success: true,
    message: 'Transaction updated successfully',
  } satisfies APIResponse
})
