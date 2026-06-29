import { Router } from 'express'
import { requireAuth } from '../middlewares/auth'
import { getAlimentoById } from '../repositories/alimentoRepository'
import {
  buscarPlanoPorData,
  criarOuAtualizarPlano,
  excluirPlano,
  RefeicaoInput,
  TipoRefeicao,
} from '../repositories/planoAlimentarRepository'
import { getUserById } from '../repositories/userRepository'
import { calcularMetaCalorica } from '../utils/metaCalorica'

const router = Router()

router.use(requireAuth)

const TIPOS_REFEICAO: TipoRefeicao[] = ['cafe_da_manha', 'almoco', 'jantar', 'lanche']

function validarRefeicoes(refeicoes: unknown): refeicoes is RefeicaoInput[] {
  if (!Array.isArray(refeicoes)) return false

  return refeicoes.every((refeicao) => {
    const r = refeicao as Record<string, unknown>
    if (!r || !TIPOS_REFEICAO.includes(r.tipo as TipoRefeicao)) return false
    if (!Array.isArray(r.alimentos)) return false

    return r.alimentos.every((item) => {
      const it = item as Record<string, unknown>
      if (!it || typeof it.alimentoId !== 'number' || typeof it.quantidade !== 'number') {
        return false
      }
      if (it.quantidade <= 0) return false
      return Boolean(getAlimentoById(it.alimentoId))
    })
  })
}

function obterMetaCalorica(usuarioId: number): number | null {
  const usuario = getUserById(usuarioId)
  if (!usuario) return null
  return calcularMetaCalorica(usuario)
}

router.get('/', (req, res) => {
  const data = String(req.query.data ?? '')
  if (!data) {
    return res.status(400).json({ message: 'Informe a data (YYYY-MM-DD)' })
  }

  const plano = buscarPlanoPorData(req.userId!, data) ?? null
  const metaCalorica = obterMetaCalorica(req.userId!)

  res.json({ plano, metaCalorica })
})

router.post('/', (req, res) => {
  const { data, refeicoes } = req.body

  if (!data || typeof data !== 'string') {
    return res.status(400).json({ message: 'Informe a data do plano' })
  }

  if (!validarRefeicoes(refeicoes)) {
    return res.status(400).json({
      message: 'Verifique as refeições: tipo válido e alimentos com quantidade maior que zero',
    })
  }

  try {
    const plano = criarOuAtualizarPlano(req.userId!, data, refeicoes)
    const metaCalorica = obterMetaCalorica(req.userId!)
    res.status(201).json({ plano, metaCalorica })
  } catch (error) {
    res.status(400).json({ message: (error as Error).message })
  }
})

router.delete('/:data', (req, res) => {
  try {
    excluirPlano(req.userId!, req.params.data)
    res.status(204).send()
  } catch (error) {
    res.status(404).json({ message: (error as Error).message })
  }
})

export default router
