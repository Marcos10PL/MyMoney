import { eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { accounts, banks } from '~~/server/db/schema'
import { createAccountBodySchema } from '~~/server/schema/body'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const body = await readValidatedBody(event, createAccountBodySchema.parse)

  const { accountResult, bankResult } = await db.transaction(async (tx) => {
    const [insertedRows, fetchedBanks] = await Promise.all([
      tx
        .insert(accounts)
        .values({
          userId: user.id,
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
        .returning(),

      body.bankId
        ? tx.select().from(banks).where(eq(banks.id, body.bankId)).limit(1)
        : Promise.resolve([]),
    ])

    return {
      accountResult: insertedRows[0],
      bankResult: fetchedBanks[0] || null,
    }
  })

  if (!accountResult || (body.bankId && !bankResult)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create account',
    })
  }

  return {
    success: true,
    message: 'Account created successfully',
    data: mapAccountToDTO(accountResult, bankResult),
  } satisfies APIResponse<Account>
})
