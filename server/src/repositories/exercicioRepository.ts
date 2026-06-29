import { db } from '../db'

export type Exercicio = {
  id: number
  nome: string
  grupo_muscular: string
  descricao: string | null
}

export function listarExercicios(): Exercicio[] {
  return db.prepare('SELECT id, nome, grupo_muscular, descricao FROM exercicios ORDER BY grupo_muscular, nome').all() as Exercicio[]
}

export function getExercicioById(id: number): Exercicio | undefined {
  return db
    .prepare('SELECT id, nome, grupo_muscular, descricao FROM exercicios WHERE id = ?')
    .get(id) as Exercicio | undefined
}
