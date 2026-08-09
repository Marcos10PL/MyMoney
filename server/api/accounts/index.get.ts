import { eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { accounts, banks } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)

  const [result, balances] = await Promise.all([
    db
      .select()
      .from(accounts)
      .leftJoin(banks, eq(accounts.bankId, banks.id))
      .where(eq(accounts.userId, user.id))
      .orderBy(accounts.createdAt),
    computeAccountBalances(user.id),
  ])

  return {
    success: true,
    message: 'Accounts fetched successfully',
    data: result.map(({ accounts, banks }) =>
      mapAccountToDTO(accounts, banks, balances[accounts.id] ?? 0)
    ),
  } satisfies APIResponse<Account[]>
})
