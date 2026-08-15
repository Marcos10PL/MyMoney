import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]
  const user = token ? await verifyMcpToken(token) : null

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  event.context.userSession = { user, loggedInAt: new Date().toISOString() }

  const server = new McpServer({ name: 'mymoney', version: '1.0.0' })
  registerMcpTools(server, user.id)

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  })
  await server.connect(transport)

  const webResponse = await transport.handleRequest(toWebRequest(event))
  return sendWebResponse(event, webResponse)
})
