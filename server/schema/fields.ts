import { z } from 'zod'

export const passwordFieldSchema = z
  .string()
  .trim()
  .min(VALIDATION.PASSWORD_MIN_LENGTH)

export const loginFieldSchema = z
  .string()
  .trim()
  .min(VALIDATION.LOGIN_MIN_LENGTH)
  .max(VALIDATION.LOGIN_MAX_LENGTH)

export const idFieldSchema = z.uuid()

export const textFieldSchema = (min: number, max: number) =>
  z.string().trim().min(min).max(max)
