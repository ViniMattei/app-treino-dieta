import { db } from '../db'

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

function buscarAlimentosDaRefeicao(refeicaoId: number): AlimentoDaRefeicao[] {
  const rows = db
    .prepare(
      `SELECT ra.id, ra.alimento_id, a.nome, ra.quantidade, a.calorias_por_100g
       FROM refeicao_alimentos ra
       JOIN alimentos a ON a.id = ra.alimento_id
       WHERE ra.refeicao_id = ?`
    )
    .all(refeicaoId) as { id: number; alimento_id: number; nome: string; quantidade: number; calorias_por_100g: number }[]

  return rows.map((row) => ({
    id: row.id,
    alimento_id: row.alimento_id,
    nome: row.nome,
    quantidade: row.quantidade,
    calorias: Math.round((row.calorias_por_100g * row.quantidade) / 100),
  }))
}

function montarPlano(plano: { id: number; data: string }): PlanoAlimentar {
  const refeicoesRows = db
    .prepare('SELECT id, tipo FROM refeicoes WHERE plano_alimentar_id = ?')
    .all(plano.id) as { id: number; tipo: TipoRefeicao }[]

  const refeicoes: RefeicaoCompleta[] = refeicoesRows.map((refeicao) => {
    const alimentos = buscarAlimentosDaRefeicao(refeicao.id)
    return {
      id: refeicao.id,
      tipo: refeicao.tipo,
      alimentos,
      caloriasTotal: alimentos.reduce((soma, item) => soma + item.calorias, 0),
    }
  })

  return {
    id: plano.id,
    data: plano.data,
    refeicoes,
    caloriasTotal: refeicoes.reduce((soma, refeicao) => soma + refeicao.caloriasTotal, 0),
  }
}

export function buscarPlanoPorData(usuarioId: number, data: string): PlanoAlimentar | undefined {
  const plano = db
    .prepare('SELECT id, data FROM planos_alimentares WHERE usuario_id = ? AND data = ?')
    .get(usuarioId, data) as { id: number; data: string } | undefined

  return plano ? montarPlano(plano) : undefined
}

function validarRefeicoes(refeicoes: RefeicaoInput[]) {
  const totalAlimentos = refeicoes.reduce((soma, r) => soma + r.alimentos.length, 0)
  if (totalAlimentos === 0) {
    throw new Error('Adicione ao menos um alimento ao plano do dia')
  }
}

function inserirRefeicoes(planoId: number, refeicoes: RefeicaoInput[]) {
  const inserirRefeicao = db.prepare('INSERT INTO refeicoes (plano_alimentar_id, tipo) VALUES (?, ?)')
  const inserirAlimento = db.prepare(
    'INSERT INTO refeicao_alimentos (refeicao_id, alimento_id, quantidade) VALUES (?, ?, ?)'
  )

  for (const refeicao of refeicoes) {
    if (refeicao.alimentos.length === 0) continue
    const resultado = inserirRefeicao.run(planoId, refeicao.tipo)
    const refeicaoId = Number(resultado.lastInsertRowid)
    for (const item of refeicao.alimentos) {
      inserirAlimento.run(refeicaoId, item.alimentoId, item.quantidade)
    }
  }
}

export function criarOuAtualizarPlano(
  usuarioId: number,
  data: string,
  refeicoes: RefeicaoInput[]
): PlanoAlimentar {
  validarRefeicoes(refeicoes)

  const salvar = db.transaction(() => {
    const existente = db
      .prepare('SELECT id FROM planos_alimentares WHERE usuario_id = ? AND data = ?')
      .get(usuarioId, data) as { id: number } | undefined

    let planoId: number

    if (existente) {
      planoId = existente.id
      db.prepare('DELETE FROM refeicoes WHERE plano_alimentar_id = ?').run(planoId)
    } else {
      const resultado = db
        .prepare('INSERT INTO planos_alimentares (usuario_id, data) VALUES (?, ?)')
        .run(usuarioId, data)
      planoId = Number(resultado.lastInsertRowid)
    }

    inserirRefeicoes(planoId, refeicoes)
  })

  salvar()
  return buscarPlanoPorData(usuarioId, data)!
}

export function excluirPlano(usuarioId: number, data: string): void {
  const existente = db
    .prepare('SELECT id FROM planos_alimentares WHERE usuario_id = ? AND data = ?')
    .get(usuarioId, data) as { id: number } | undefined

  if (!existente) {
    throw new Error('Plano alimentar não encontrado')
  }

  db.prepare('DELETE FROM planos_alimentares WHERE id = ?').run(existente.id)
}
