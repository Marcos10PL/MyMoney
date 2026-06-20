import z from 'zod'
import { loginFieldSchema, passwordFieldSchema } from './fields'

export const loginSchema = z.object({
  login: loginFieldSchema,
  password: passwordFieldSchema,
})
