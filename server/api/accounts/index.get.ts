import { eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { accounts, banks } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)

  const result = await db
    .select({
      id: accounts.id,
      bankId: accounts.bankId,
      bank: { id: banks.id, name: banks.name },
      name: accounts.name,
      description: accounts.description,
      type: accounts.type,
      percentage: accounts.percentage,
      isFree: accounts.isFree,
      conditions: accounts.conditions,
      startDate: accounts.startDate,
      duration: accounts.duration,
      durationEndDate: accounts.durationEndDate,
      isActive: accounts.isActive,
      createdAt: accounts.createdAt,
      updatedAt: accounts.updatedAt,
    })
    .from(accounts)
    .leftJoin(banks, eq(accounts.bankId, banks.id))
    .where(eq(accounts.userId, user.id))

  return {
    success: true,
    message: 'Accounts fetched successfully',
    data: result,
  } satisfies APIResponse<Account[]>
})
