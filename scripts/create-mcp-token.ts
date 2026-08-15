import { randomBytes } from 'node:crypto'
import { eq, isNull, and } from 'drizzle-orm'
import prompts from 'prompts'
import { db } from '../server/db/conn'
import { users } from '../server/db/schema/index'
import { hashMcpToken } from '../server/utils/mcp-token'

const createMcpToken = async () => {
  console.log('Generating MCP token...')

  const response = await prompts({
    type: 'text',
    name: 'login',
    message: 'Enter login of the user to grant MCP access to:',
  })

  if (!response.login) {
    console.log('Cancelled.')
    process.exit(0)
  }

  const user = await db.query.users.findFirst({
    where: and(eq(users.login, response.login.trim()), isNull(users.deletedAt)),
  })

  if (!user) {
    console.log(`No user found with login "${response.login}".`)
    process.exit(1)
  }

  const token = randomBytes(32).toString('hex')

  try {
    await db
      .update(users)
      .set({ mcpTokenHash: hashMcpToken(token) })
      .where(eq(users.id, user.id))

    console.log(`\nSuccess - MCP token generated for ${user.login}.`)
    console.log(
      'This token is shown only once - copy it now and use it as the Bearer token in your MCP client:\n'
    )
    console.log(token)
    console.log(
      '\nRunning this again for the same user overwrites the previous token (old one stops working).'
    )
  } catch (err) {
    console.log(err)
  } finally {
    process.exit(0)
  }
}

createMcpToken()
