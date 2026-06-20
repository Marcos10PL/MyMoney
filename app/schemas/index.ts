import z from 'zod'
import {
  loginFieldSchema,
  passwordFieldSchema,
  textFieldSchema,
} from './fields'

export const loginSchema = z.object({
  login: loginFieldSchema,
  password: passwordFieldSchema,
})

export const bankSchema = z.object({
  name: textFieldSchema(
    VALIDATION.BANK_NAME_MIN_LENGTH,
    VALIDATION.BANK_NAME_MAX_LENGTH
  ),
})
