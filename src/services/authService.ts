import { api } from './api'

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

type AuthResponse = { usuario: Usuario; token: string }

export type DadosCadastro = {
  nomeCompleto: string
  email: string
  senha: string
  dataNascimento: string
  sexo: Sexo
  pesoAtual: number
  altura: number
}

export function cadastrar(dados: DadosCadastro) {
  return api.post<AuthResponse>('/usuarios', dados)
}

export function login(email: string, senha: string) {
  return api.post<AuthResponse>('/sessoes', { email, senha })
}

export function buscarUsuarioLogado(token: string) {
  return api.get<{ usuario: Usuario }>('/usuarios/me', token)
}

export function definirObjetivo(objetivo: Objetivo, token: string) {
  return api.patch<{ usuario: Usuario }>(
    '/usuarios/me/objetivo',
    { objetivo },
    token
  )
}
