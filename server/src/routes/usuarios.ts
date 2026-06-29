import { Router } from 'express'
import { requireAuth } from '../middlewares/auth'
import {
  createUser,
  getUserById,
  Objetivo,
  Sexo,
  updateObjetivo,
} from '../repositories/userRepository'
import { generateToken } from '../utils/jwt'

const router = Router()

const SEXOS: Sexo[] = ['masculino', 'feminino']
const OBJETIVOS: Objetivo[] = ['perda_peso', 'ganho_massa', 'manutencao']

router.post('/', async (req, res) => {
  const { nomeCompleto, email, senha, dataNascimento, sexo, pesoAtual, altura } =
    req.body

  if (!nomeCompleto || !email || !senha || !dataNascimento || !sexo) {
    return res.status(400).json({ message: 'Preencha todos os campos obrigatórios' })
  }

  if (senha.length < 8) {
    return res.status(400).json({ message: 'A senha deve conter no mínimo 8 caracteres' })
  }

  if (!SEXOS.includes(sexo)) {
    return res.status(400).json({ message: 'Sexo inválido' })
  }

  if (!pesoAtual || !altura) {
    return res.status(400).json({ message: 'Informe peso atual e altura' })
  }

  try {
    const usuario = await createUser({
      nomeCompleto,
      email,
      senha,
      dataNascimento,
      sexo,
      pesoAtual: Number(pesoAtual),
      altura: Number(altura),
    })

    const token = generateToken(usuario.id)
    res.status(201).json({ usuario, token })
  } catch (error) {
    res.status(409).json({ message: (error as Error).message })
  }
})

router.get('/me', requireAuth, (req, res) => {
  const usuario = getUserById(req.userId!)

  if (!usuario) {
    return res.status(404).json({ message: 'Usuário não encontrado' })
  }

  res.json({ usuario })
})

router.patch('/me/objetivo', requireAuth, (req, res) => {
  const { objetivo } = req.body

  if (!OBJETIVOS.includes(objetivo)) {
    return res.status(400).json({ message: 'Objetivo inválido' })
  }

  const usuario = updateObjetivo(req.userId!, objetivo)
  res.json({ usuario })
})

export default router
