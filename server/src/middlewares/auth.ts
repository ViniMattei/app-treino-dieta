import { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../utils/jwt'

declare global {
  namespace Express {
    interface Request {
      userId?: number
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não informado' })
  }

  try {
    req.userId = verifyToken(authHeader.replace('Bearer ', ''))
    next()
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' })
  }
}
