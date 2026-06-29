import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export function hashPassword(senha: string) {
  return bcrypt.hash(senha, SALT_ROUNDS)
}

export function comparePassword(senha: string, hash: string) {
  return bcrypt.compare(senha, hash)
}
