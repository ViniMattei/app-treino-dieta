import { api } from './api'

export type Alimento = {
  id: number
  nome: string
  calorias_por_100g: number
  proteinas: number
  carboidratos: number
  gorduras: number
}

export type TipoRefeicao = 'cafe_da_manha' | 'almoco' | 'jantar' | 'lanche'

export type ItemRefeicao = {
  alimentoId: number
  quantidade: number
}

export type RefeicaoInput = {
  tipo: TipoRefeicao
  alimentos: ItemRefeicao[]
}

export type AlimentoDaRefeicao = {
  id: number
  alimento_id: number
  nome: string
  quantidade: number
  calorias: number
}

export type RefeicaoCompleta = {
  id: number
  tipo: TipoRefeicao
  alimentos: AlimentoDaRefeicao[]
  caloriasTotal: number
}

export type PlanoAlimentar = {
  id: number
  data: string
  refeicoes: RefeicaoCompleta[]
  caloriasTotal: number
}

type RespostaPlano = { plano: PlanoAlimentar | null; metaCalorica: number | null }

export function listarAlimentos(token: string) {
  return api.get<{ alimentos: Alimento[] }>('/alimentos', token)
}

export function criarAlimento(
  dados: {
    nome: string
    caloriasPor100g: number
    proteinas?: number
    carboidratos?: number
    gorduras?: number
  },
  token: string
) {
  return api.post<{ alimento: Alimento }>('/alimentos', dados, token)
}

export function buscarPlanoPorData(data: string, token: string) {
  return api.get<RespostaPlano>(`/planos-alimentares?data=${data}`, token)
}

export function salvarPlano(
  dados: { data: string; refeicoes: RefeicaoInput[] },
  token: string
) {
  return api.post<RespostaPlano>('/planos-alimentares', dados, token)
}

export function excluirPlano(data: string, token: string) {
  return api.delete(`/planos-alimentares/${data}`, token)
}
