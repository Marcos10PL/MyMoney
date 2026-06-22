import { eq } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { banks } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)

  const result = await db.select().from(banks).where(eq(banks.userId, user.id))

  return {
    success: true,
    message: 'Banks fetched successfully',
    data: result.map((bank) => mapBankToDTO(bank)),
  } satisfies APIResponse<Bank[]>
})
