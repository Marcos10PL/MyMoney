import { Hash } from '@adonisjs/hash'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'
import prompts from 'prompts'
import { db } from '../server/db/conn'
import { users } from '../server/db/schema/index'
import { USER_ROLES, VALIDATION } from '../shared/utils/const'

const hash = new Hash(new Scrypt({}))

const hashPassword = async (password: string) => await hash.make(password)

const minLength = (min: number) => (value: string) =>
  value.length >= min ? true : `Minimum ${min} characters required`

const createAdmin = async () => {
  console.log('Creating admin user...')

  const response = await prompts([
    {
      type: 'text',
      name: 'login',
      message: 'Enter admin login:',
      validate: minLength(VALIDATION.LOGIN_MIN_LENGTH),
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter password:',
      validate: minLength(VALIDATION.PASSWORD_MIN_LENGTH),
    },
  ])

  if (!response.login || !response.password) {
    console.log('Cancelled.')
    process.exit(0)
  }

  const hashedPassword = await hashPassword(response.password)

  try {
    await db.insert(users).values({
      login: response.login.trim(),
      password: hashedPassword,
      role: USER_ROLES.ADMIN,
    })

    console.log(`Success - Admin ${response.login} has been created.`)
  } catch (err) {
    console.log(err)
  } finally {
    process.exit(0)
  }
}

createAdmin()
