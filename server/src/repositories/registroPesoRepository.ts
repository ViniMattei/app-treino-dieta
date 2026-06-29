import { db } from '../db'

export type RegistroPeso = {
  id: number
  peso: number
  data: string
}

export function listarHistorico(usuarioId: number): RegistroPeso[] {
  return db
    .prepare('SELECT id, peso, data FROM registros_peso WHERE usuario_id = ? ORDER BY data ASC')
    .all(usuarioId) as RegistroPeso[]
}

export function registrarPeso(usuarioId: number, peso: number, data: string): RegistroPeso {
  const salvar = db.transaction(() => {
    db.prepare(
      `INSERT INTO registros_peso (usuario_id, peso, data)
       VALUES (?, ?, ?)
       ON CONFLICT(usuario_id, data) DO UPDATE SET peso = excluded.peso`
    ).run(usuarioId, peso, data)

    db.prepare('UPDATE usuarios SET peso_atual = ? WHERE id = ?').run(peso, usuarioId)
  })

  salvar()

  return db
    .prepare('SELECT id, peso, data FROM registros_peso WHERE usuario_id = ? AND data = ?')
    .get(usuarioId, data) as RegistroPeso
}

export function excluirRegistro(usuarioId: number, data: string): void {
  const existente = db
    .prepare('SELECT id FROM registros_peso WHERE usuario_id = ? AND data = ?')
    .get(usuarioId, data) as { id: number } | undefined

  if (!existente) {
    throw new Error('Registro de peso não encontrado')
  }

  db.prepare('DELETE FROM registros_peso WHERE id = ?').run(existente.id)
}
