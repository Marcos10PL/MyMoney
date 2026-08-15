import { and, eq, isNull } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { users } from '~~/server/db/schema'
import type { UserSession } from '#auth-utils'
import { hashMcpToken } from './mcp-token'

export const verifyMcpToken = async (
  token: string
): Promise<UserSession['user'] | null> => {
  const hash = hashMcpToken(token)

  const user = await db.query.users.findFirst({
    where: and(eq(users.mcpTokenHash, hash), isNull(users.deletedAt)),
  })

  if (!user) return null

  return { id: user.id, login: user.login, role: user.role }
}
