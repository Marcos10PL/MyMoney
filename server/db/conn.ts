import 'dotenv/config'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import type { PgDatabase } from 'drizzle-orm/pg-core'
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js'
import type { ExtractTablesWithRelations } from 'drizzle-orm'
import * as schema from './schema'

const isNeon = process.env.DATABASE_URL?.includes('neon.tech')
const client = postgres(process.env.DATABASE_URL!, {
  ssl: isNeon ? 'require' : false,
})
export const db = drizzle(client, { schema })

export type DB = PgDatabase<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>
