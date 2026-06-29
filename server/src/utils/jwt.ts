import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-app-treino-dieta'
const SESSION_EXPIRATION = '30d'

export function generateToken(userId: number) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: SESSION_EXPIRATION })
}

export function verifyToken(token: string): number {
  const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
  return Number(payload.sub)
}
