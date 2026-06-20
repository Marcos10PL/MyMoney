import type { InferSelectModel } from 'drizzle-orm'
import type { users } from '../../server/db/schema'

// entities
export type AppUser = InferSelectModel<typeof users>

// enums
export type AppUserRoles = AppUser['role']
