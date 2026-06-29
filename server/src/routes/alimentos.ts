import { Router } from 'express'
import { requireAuth } from '../middlewares/auth'
import { criarAlimento, listarAlimentos } from '../repositories/alimentoRepository'

const router = Router()

router.use(requireAuth)

router.get('/', (_req, res) => {
  res.json({ alimentos: listarAlimentos() })
})

router.post('/', (req, res) => {
  const { nome, caloriasPor100g, proteinas, carboidratos, gorduras } = req.body

  if (!nome || typeof nome !== 'string') {
    return res.status(400).json({ message: 'Informe o nome do alimento' })
  }

  if (typeof caloriasPor100g !== 'number' || caloriasPor100g < 0) {
    return res.status(400).json({ message: 'Informe as calorias por 100g/ml' })
  }

  const alimento = criarAlimento({
    nome,
    caloriasPor100g,
    proteinas: typeof proteinas === 'number' ? proteinas : 0,
    carboidratos: typeof carboidratos === 'number' ? carboidratos : 0,
    gorduras: typeof gorduras === 'number' ? gorduras : 0,
  })

  res.status(201).json({ alimento })
})

export default router
