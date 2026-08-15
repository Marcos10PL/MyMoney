import { eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { accounts, banks } from '~~/server/db/schema'

export const listAccounts = async (userId: string): Promise<Account[]> => {
  const [result, balances] = await Promise.all([
    db
      .select()
      .from(accounts)
      .leftJoin(banks, eq(accounts.bankId, banks.id))
      .where(eq(accounts.userId, userId))
      .orderBy(accounts.createdAt),
    computeAccountBalances(userId),
  ])

  return result.map(({ accounts, banks }) =>
    mapAccountToDTO(accounts, banks, balances[accounts.id] ?? 0)
  )
}
