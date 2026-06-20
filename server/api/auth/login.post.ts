import { and, eq, isNull } from 'drizzle-orm'
import { db } from '~~/server/db/conn'
import { users } from '~~/server/db/schema/users'
import type { UserSession } from '#auth-utils'
import { loginBodySchema } from '~~/server/schema/body'

export default defineEventHandler(async (event) => {
  const { login, password } = await readValidatedBody(
    event,
    loginBodySchema.parse
  )

  const user = await db.query.users.findFirst({
    where: and(eq(users.login, login), isNull(users.deletedAt)),
  })

  const isPasswordCorrect = await verifyPassword(user?.password || '', password)

  if (!user || !isPasswordCorrect) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const loggedUser = {
    id: user.id,
    login: user.login,
    role: user.role,
  } satisfies UserSession['user']

  await setUserSession(event, {
    user: loggedUser,
    loggedInAt: new Date().toISOString(),
  })

  return {
    success: true,
    message: 'Login successful',
    data: {
      user: loggedUser,
    },
  } satisfies APIResponse<{ user: UserSession['user'] }>
})
