import { z } from 'zod'

export const passwordFieldSchema = z
  .string()
  .trim()
  .min(
    VALIDATION.PASSWORD_MIN_LENGTH,
    `Hasło musi mieć co najmniej ${VALIDATION.PASSWORD_MIN_LENGTH} znaków.`
  )

export const loginFieldSchema = z
  .string()
  .trim()
  .min(VALIDATION.LOGIN_MIN_LENGTH, 'Login jest zbyt krótki.')
