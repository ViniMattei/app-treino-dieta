import { api } from './api'

export type Exercicio = {
  id: number
  nome: string
  grupo_muscular: string
  descricao: string | null
}

export type ItemPlano = {
  exercicioId: number
  series: number
  repeticoes?: number
  duracao?: number
}

export type ExercicioDoPlano = {
  id: number
  exercicio_id: number
  nome: string
  grupo_muscular: string
  series: number
  repeticoes: number | null
  duracao: number | null
}

export type PlanoTreino = {
  id: number
  nome: string
  ativo: boolean
  created_at: string
  exercicios: ExercicioDoPlano[]
}

export function listarExercicios(token: string) {
  return api.get<{ exercicios: Exercicio[] }>('/exercicios', token)
}

export function listarPlanos(token: string) {
  return api.get<{ planos: PlanoTreino[] }>('/planos-treino', token)
}

export function criarPlano(dados: { nome: string; exercicios: ItemPlano[] }, token: string) {
  return api.post<{ plano: PlanoTreino }>('/planos-treino', dados, token)
}

export function ativarPlano(id: number, token: string) {
  return api.patch<{ plano: PlanoTreino }>(`/planos-treino/${id}/ativar`, {}, token)
}

export function excluirPlano(id: number, token: string) {
  return api.delete(`/planos-treino/${id}`, token)
}
