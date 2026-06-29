import { db } from '../db'

export type Alimento = {
  id: number
  nome: string
  calorias_por_100g: number
  proteinas: number
  carboidratos: number
  gorduras: number
}

export function listarAlimentos(): Alimento[] {
  return db.prepare('SELECT * FROM alimentos ORDER BY nome').all() as Alimento[]
}

export function getAlimentoById(id: number): Alimento | undefined {
  return db.prepare('SELECT * FROM alimentos WHERE id = ?').get(id) as Alimento | undefined
}

type NovoAlimento = {
  nome: string
  caloriasPor100g: number
  proteinas: number
  carboidratos: number
  gorduras: number
}

export function criarAlimento(dados: NovoAlimento): Alimento {
  const resultado = db
    .prepare(
      'INSERT INTO alimentos (nome, calorias_por_100g, proteinas, carboidratos, gorduras) VALUES (?, ?, ?, ?, ?)'
    )
    .run(dados.nome.trim(), dados.caloriasPor100g, dados.proteinas, dados.carboidratos, dados.gorduras)

  return getAlimentoById(Number(resultado.lastInsertRowid))!
}
