import { Objetivo, Sexo } from '../repositories/userRepository'

type DadosUsuario = {
  peso_atual: number
  altura: number
  data_nascimento: string
  sexo: Sexo
  objetivo: Objetivo | null
}

function calcularIdade(dataNascimento: string): number {
  const nascimento = new Date(dataNascimento)
  const hoje = new Date()

  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())

  if (aindaNaoFezAniversario) idade -= 1

  return idade
}

const AJUSTE_POR_OBJETIVO: Record<Objetivo, number> = {
  perda_peso: -500,
  ganho_massa: 300,
  manutencao: 0,
}

export function calcularMetaCalorica(usuario: DadosUsuario): number {
  const idade = calcularIdade(usuario.data_nascimento)
  const alturaCm = usuario.altura * 100

  const taxaMetabolicaBasal =
    usuario.sexo === 'masculino'
      ? 10 * usuario.peso_atual + 6.25 * alturaCm - 5 * idade + 5
      : 10 * usuario.peso_atual + 6.25 * alturaCm - 5 * idade - 161

  const gastoTotalDiario = taxaMetabolicaBasal * 1.2
  const ajuste = usuario.objetivo ? AJUSTE_POR_OBJETIVO[usuario.objetivo] : 0

  return Math.round(gastoTotalDiario + ajuste)
}
