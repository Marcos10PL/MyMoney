import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { accounts, banks } from '~~/server/db/schema'
import { idParamSchema } from '~~/server/schema/query'
import { updateAccountBodySchema } from '~~/server/schema/body'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
  const body = await readValidatedBody(event, updateAccountBodySchema.parse)

  const { accountResult, bankResult } = await db.transaction(async (tx) => {
    const [updatedRows, fetchedBanks] = await Promise.all([
      tx
        .update(accounts)
        .set({
          bankId: body.bankId,
          name: body.name,
          description: body.description ?? null,
          type: body.type,
          percentage: body.percentage ? String(body.percentage) : null,
          isFree: body.isFree,
          conditions: body.conditions ?? null,
          startDate: new Date(body.startDate),
          duration: body.duration,
          durationEndDate: body.durationEndDate
            ? new Date(body.durationEndDate)
            : null,
          isActive: body.isActive,
        })
        .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)))
        .returning(),

      body.bankId
        ? tx.select().from(banks).where(eq(banks.id, body.bankId)).limit(1)
        : Promise.resolve([]),
    ])

    return {
      accountResult: updatedRows[0],
      bankResult: fetchedBanks[0] || null,
    }
  })

  if (!accountResult || (body.bankId && !bankResult)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update account',
    })
  }

  return {
    success: true,
    message: 'Account updated successfully',
    data: mapAccountToDTO(accountResult, bankResult),
  } satisfies APIResponse<Account>
})
