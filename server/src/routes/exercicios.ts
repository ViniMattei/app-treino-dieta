import { Router } from 'express'
import { requireAuth } from '../middlewares/auth'
import { listarExercicios } from '../repositories/exercicioRepository'

const router = Router()

router.get('/', requireAuth, (_req, res) => {
  res.json({ exercicios: listarExercicios() })
})

export default router
