import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { accounts } from '~~/server/db/schema'
import { idParamSchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)

  const [deletedAccount] = await db
    .delete(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)))
    .returning()

  if (!deletedAccount) {
    throw createError({ statusCode: 404, message: 'Account not found' })
  }

  return {
    success: true,
    message: 'Account deleted successfully',
  } satisfies APIResponse
})
