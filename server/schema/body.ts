import { z } from 'zod'
import { loginFieldSchema, passwordFieldSchema } from './fields'

export const loginBodySchema = z.object({
  login: loginFieldSchema,
  password: passwordFieldSchema,
})
