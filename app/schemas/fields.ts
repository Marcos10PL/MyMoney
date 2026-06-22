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

export const idFieldSchema = z.uuid('Pole jest wymagane')

export const textFieldSchema = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `Minimalna długość pola: ${min}`)
    .max(max, `Maksymalna długość pola: ${max}`)
