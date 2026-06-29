import { db } from '../db'

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

type DadosPlano = {
  nome: string
  exercicios: ItemPlano[]
}

const ITENS_FIELDS = `
  pte.id, pte.exercicio_id, e.nome, e.grupo_muscular, pte.series, pte.repeticoes, pte.duracao
`

function buscarItensDoPlano(planoId: number): ExercicioDoPlano[] {
  return db
    .prepare(
      `SELECT ${ITENS_FIELDS}
       FROM plano_treino_exercicios pte
       JOIN exercicios e ON e.id = pte.exercicio_id
       WHERE pte.plano_treino_id = ?`
    )
    .all(planoId) as ExercicioDoPlano[]
}

function montarPlano(row: { id: number; nome: string; ativo: number; created_at: string }): PlanoTreino {
  return {
    id: row.id,
    nome: row.nome,
    ativo: Boolean(row.ativo),
    created_at: row.created_at,
    exercicios: buscarItensDoPlano(row.id),
  }
}

export function listarPlanosPorUsuario(usuarioId: number): PlanoTreino[] {
  const planos = db
    .prepare('SELECT id, nome, ativo, created_at FROM planos_treino WHERE usuario_id = ? ORDER BY created_at DESC')
    .all(usuarioId) as { id: number; nome: string; ativo: number; created_at: string }[]

  return planos.map(montarPlano)
}

export function buscarPlanoPorId(id: number, usuarioId: number): PlanoTreino | undefined {
  const plano = db
    .prepare('SELECT id, nome, ativo, created_at FROM planos_treino WHERE id = ? AND usuario_id = ?')
    .get(id, usuarioId) as { id: number; nome: string; ativo: number; created_at: string } | undefined

  return plano ? montarPlano(plano) : undefined
}

function validarExercicios(exercicios: ItemPlano[]) {
  if (!exercicios || exercicios.length === 0) {
    throw new Error('Um plano de treino deve conter pelo menos um exercício')
  }
}

function inserirItens(planoId: number, exercicios: ItemPlano[]) {
  const inserir = db.prepare(
    'INSERT INTO plano_treino_exercicios (plano_treino_id, exercicio_id, series, repeticoes, duracao) VALUES (?, ?, ?, ?, ?)'
  )
  for (const item of exercicios) {
    inserir.run(planoId, item.exercicioId, item.series, item.repeticoes ?? null, item.duracao ?? null)
  }
}

export function criarPlano(usuarioId: number, dados: DadosPlano): PlanoTreino {
  validarExercicios(dados.exercicios)

  const criar = db.transaction(() => {
    const resultado = db
      .prepare('INSERT INTO planos_treino (usuario_id, nome) VALUES (?, ?)')
      .run(usuarioId, dados.nome.trim())

    const planoId = Number(resultado.lastInsertRowid)
    inserirItens(planoId, dados.exercicios)

    return planoId
  })

  const planoId = criar()
  const plano = buscarPlanoPorId(planoId, usuarioId)
  if (!plano) {
    throw new Error('Não foi possível criar o plano de treino')
  }

  return plano
}

export function atualizarPlano(id: number, usuarioId: number, dados: DadosPlano): PlanoTreino {
  validarExercicios(dados.exercicios)

  const existente = buscarPlanoPorId(id, usuarioId)
  if (!existente) {
    throw new Error('Plano de treino não encontrado')
  }

  const atualizar = db.transaction(() => {
    db.prepare('UPDATE planos_treino SET nome = ? WHERE id = ?').run(dados.nome.trim(), id)
    db.prepare('DELETE FROM plano_treino_exercicios WHERE plano_treino_id = ?').run(id)
    inserirItens(id, dados.exercicios)
  })

  atualizar()

  return buscarPlanoPorId(id, usuarioId)!
}

export function ativarPlano(id: number, usuarioId: number): PlanoTreino {
  const existente = buscarPlanoPorId(id, usuarioId)
  if (!existente) {
    throw new Error('Plano de treino não encontrado')
  }

  const ativar = db.transaction(() => {
    db.prepare('UPDATE planos_treino SET ativo = 0 WHERE usuario_id = ?').run(usuarioId)
    db.prepare('UPDATE planos_treino SET ativo = 1 WHERE id = ?').run(id)
  })

  ativar()

  return buscarPlanoPorId(id, usuarioId)!
}

export function excluirPlano(id: number, usuarioId: number): void {
  const existente = buscarPlanoPorId(id, usuarioId)
  if (!existente) {
    throw new Error('Plano de treino não encontrado')
  }

  db.prepare('DELETE FROM planos_treino WHERE id = ?').run(id)
}
