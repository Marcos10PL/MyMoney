import { z } from 'zod'
import { idFieldSchema } from './fields'

export const idParamSchema = z.object({
  id: idFieldSchema,
})
