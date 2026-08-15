import { createHash } from 'node:crypto'

export const hashMcpToken = (token: string) =>
  createHash('sha256').update(token).digest('hex')
