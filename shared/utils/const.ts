export const VALIDATION = {
  LOGIN_MIN_LENGTH: 3,
  LOGIN_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 8,
} as const

export const USER_ROLES: Record<string, AppUserRoles> = {
  ADMIN: 'admin',
} as const
