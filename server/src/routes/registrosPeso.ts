import { Router } from 'express'
import { requireAuth } from '../middlewares/auth'
import {
  excluirRegistro,
  listarHistorico,
  registrarPeso,
} from '../repositories/registroPesoRepository'

const router = Router()

router.use(requireAuth)

router.get('/', (req, res) => {
  res.json({ registros: listarHistorico(req.userId!) })
})

router.post('/', (req, res) => {
  const { peso, data } = req.body

  if (typeof peso !== 'number' || peso <= 0) {
    return res.status(400).json({ message: 'Informe um peso válido' })
  }

  if (!data || typeof data !== 'string') {
    return res.status(400).json({ message: 'Informe a data do registro' })
  }

  const registro = registrarPeso(req.userId!, peso, data)
  res.status(201).json({ registro })
})

router.delete('/:data', (req, res) => {
  try {
    excluirRegistro(req.userId!, req.params.data)
    res.status(204).send()
  } catch (error) {
    res.status(404).json({ message: (error as Error).message })
  }
})

export default router
