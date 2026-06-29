import { db } from '../db'
import { hashPassword } from '../utils/hash'

export type Objetivo = 'perda_peso' | 'ganho_massa' | 'manutencao'
export type Sexo = 'masculino' | 'feminino'

export type Usuario = {
  id: number
  nome_completo: string
  email: string
  data_nascimento: string
  sexo: Sexo
  peso_atual: number
  altura: number
  objetivo: Objetivo | null
}

export type UsuarioComSenha = Usuario & { senha_hash: string }

type NovoUsuario = {
  nomeCompleto: string
  email: string
  senha: string
  dataNascimento: string
  sexo: Sexo
  pesoAtual: number
  altura: number
}

const USUARIO_FIELDS =
  'id, nome_completo, email, data_nascimento, sexo, peso_atual, altura, objetivo'

export function getUserByEmail(email: string): UsuarioComSenha | undefined {
  return db
    .prepare(
      `SELECT ${USUARIO_FIELDS}, senha_hash FROM usuarios WHERE email = ?`
    )
    .get(email.trim().toLowerCase()) as UsuarioComSenha | undefined
}

export function getUserById(id: number): Usuario | undefined {
  return db
    .prepare(`SELECT ${USUARIO_FIELDS} FROM usuarios WHERE id = ?`)
    .get(id) as Usuario | undefined
}

export async function createUser(dados: NovoUsuario): Promise<Usuario> {
  const email = dados.email.trim().toLowerCase()

  if (getUserByEmail(email)) {
    throw new Error('Este e-mail já está cadastrado')
  }

  const senhaHash = await hashPassword(dados.senha)

  const resultado = db
    .prepare(
      `INSERT INTO usuarios
        (nome_completo, email, senha_hash, data_nascimento, sexo, peso_atual, altura)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      dados.nomeCompleto.trim(),
      email,
      senhaHash,
      dados.dataNascimento,
      dados.sexo,
      dados.pesoAtual,
      dados.altura
    )

  const usuario = getUserById(Number(resultado.lastInsertRowid))
  if (!usuario) {
    throw new Error('Não foi possível criar o usuário')
  }

  return usuario
}

export function updateObjetivo(userId: number, objetivo: Objetivo): Usuario {
  db.prepare(`UPDATE usuarios SET objetivo = ? WHERE id = ?`).run(
    objetivo,
    userId
  )

  const usuario = getUserById(userId)
  if (!usuario) {
    throw new Error('Usuário não encontrado')
  }

  return usuario
}
