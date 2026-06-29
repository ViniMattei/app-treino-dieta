import { api } from './api'

export type RegistroPeso = {
  id: number
  peso: number
  data: string
}

export function listarHistorico(token: string) {
  return api.get<{ registros: RegistroPeso[] }>('/registros-peso', token)
}

export function registrarPeso(dados: { peso: number; data: string }, token: string) {
  return api.post<{ registro: RegistroPeso }>('/registros-peso', dados, token)
}

export function excluirRegistro(data: string, token: string) {
  return api.delete(`/registros-peso/${data}`, token)
}
