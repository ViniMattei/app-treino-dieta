import { Router } from 'express'
import { getUserByEmail } from '../repositories/userRepository'
import { comparePassword } from '../utils/hash'
import { generateToken } from '../utils/jwt'

const router = Router()

router.post('/', async (req, res) => {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({ message: 'Preencha email e senha' })
  }

  const usuarioComSenha = getUserByEmail(email)
  if (!usuarioComSenha) {
    return res.status(401).json({ message: 'E-mail ou senha inválidos' })
  }

  const senhaValida = await comparePassword(senha, usuarioComSenha.senha_hash)
  if (!senhaValida) {
    return res.status(401).json({ message: 'E-mail ou senha inválidos' })
  }

  const { senha_hash, ...usuario } = usuarioComSenha
  const token = generateToken(usuario.id)

  res.json({ usuario, token })
})

export default router
