// ---- COMMON RESPONSE TYPE ----

export type APIResponse<T = unknown> = {
  message: string
} & (
  | {
      success: true
      data?: T
      pagination?: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }
  | { success: false; data?: never; pagination?: never }
)
