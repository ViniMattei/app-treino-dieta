import { Router } from 'express'
import { requireAuth } from '../middlewares/auth'
import { getExercicioById } from '../repositories/exercicioRepository'
import {
  ativarPlano,
  atualizarPlano,
  buscarPlanoPorId,
  criarPlano,
  excluirPlano,
  ItemPlano,
  listarPlanosPorUsuario,
} from '../repositories/planoTreinoRepository'

const router = Router()

router.use(requireAuth)

function validarItens(exercicios: unknown): exercicios is ItemPlano[] {
  if (!Array.isArray(exercicios)) return false

  return exercicios.every((item) => {
    const it = item as Record<string, unknown>
    if (!it || typeof it.exercicioId !== 'number' || typeof it.series !== 'number') {
      return false
    }
    if (!getExercicioById(it.exercicioId)) return false
    if (it.repeticoes == null && it.duracao == null) return false
    return true
  })
}

router.get('/', (req, res) => {
  res.json({ planos: listarPlanosPorUsuario(req.userId!) })
})

router.get('/:id', (req, res) => {
  const plano = buscarPlanoPorId(Number(req.params.id), req.userId!)
  if (!plano) {
    return res.status(404).json({ message: 'Plano de treino não encontrado' })
  }
  res.json({ plano })
})

router.post('/', (req, res) => {
  const { nome, exercicios } = req.body

  if (!nome || typeof nome !== 'string') {
    return res.status(400).json({ message: 'Informe o nome do plano' })
  }

  if (!validarItens(exercicios)) {
    return res.status(400).json({
      message: 'Selecione ao menos um exercício válido, com séries e repetições ou duração',
    })
  }

  try {
    const plano = criarPlano(req.userId!, { nome, exercicios })
    res.status(201).json({ plano })
  } catch (error) {
    res.status(400).json({ message: (error as Error).message })
  }
})

router.put('/:id', (req, res) => {
  const { nome, exercicios } = req.body

  if (!nome || typeof nome !== 'string') {
    return res.status(400).json({ message: 'Informe o nome do plano' })
  }

  if (!validarItens(exercicios)) {
    return res.status(400).json({
      message: 'Selecione ao menos um exercício válido, com séries e repetições ou duração',
    })
  }

  try {
    const plano = atualizarPlano(Number(req.params.id), req.userId!, { nome, exercicios })
    res.json({ plano })
  } catch (error) {
    res.status(404).json({ message: (error as Error).message })
  }
})

router.patch('/:id/ativar', (req, res) => {
  try {
    const plano = ativarPlano(Number(req.params.id), req.userId!)
    res.json({ plano })
  } catch (error) {
    res.status(404).json({ message: (error as Error).message })
  }
})

router.delete('/:id', (req, res) => {
  try {
    excluirPlano(Number(req.params.id), req.userId!)
    res.status(204).send()
  } catch (error) {
    res.status(404).json({ message: (error as Error).message })
  }
})

export default router
