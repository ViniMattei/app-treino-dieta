import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.join(__dirname, '..', 'data', 'app.db'))

db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_completo TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    data_nascimento TEXT NOT NULL,
    sexo TEXT NOT NULL,
    peso_atual REAL NOT NULL,
    altura REAL NOT NULL,
    objetivo TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS exercicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    grupo_muscular TEXT NOT NULL,
    descricao TEXT
  );

  CREATE TABLE IF NOT EXISTS planos_treino (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    ativo INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS plano_treino_exercicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plano_treino_id INTEGER NOT NULL REFERENCES planos_treino(id) ON DELETE CASCADE,
    exercicio_id INTEGER NOT NULL REFERENCES exercicios(id),
    series INTEGER NOT NULL,
    repeticoes INTEGER,
    duracao INTEGER
  );

  CREATE TABLE IF NOT EXISTS alimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    calorias_por_100g REAL NOT NULL,
    proteinas REAL NOT NULL,
    carboidratos REAL NOT NULL,
    gorduras REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS planos_alimentares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(usuario_id, data)
  );

  CREATE TABLE IF NOT EXISTS registros_peso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    peso REAL NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(usuario_id, data)
  );

  CREATE TABLE IF NOT EXISTS refeicoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plano_alimentar_id INTEGER NOT NULL REFERENCES planos_alimentares(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS refeicao_alimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    refeicao_id INTEGER NOT NULL REFERENCES refeicoes(id) ON DELETE CASCADE,
    alimento_id INTEGER NOT NULL REFERENCES alimentos(id),
    quantidade REAL NOT NULL
  );
`)

const BIBLIOTECA_EXERCICIOS = [
  { nome: 'Supino reto', grupo_muscular: 'Peito', descricao: 'Com barra ou halteres, no banco reto.' },
  { nome: 'Crucifixo', grupo_muscular: 'Peito', descricao: 'Com halteres, banco reto ou inclinado.' },
  { nome: 'Puxada frontal', grupo_muscular: 'Costas', descricao: 'Na polia alta, pegada pronada.' },
  { nome: 'Remada curvada', grupo_muscular: 'Costas', descricao: 'Com barra ou halteres, tronco inclinado.' },
  { nome: 'Agachamento livre', grupo_muscular: 'Perna', descricao: 'Com barra nas costas ou peso corporal.' },
  { nome: 'Leg press', grupo_muscular: 'Perna', descricao: 'Na máquina, pés na largura dos ombros.' },
  { nome: 'Desenvolvimento com halteres', grupo_muscular: 'Ombro', descricao: 'Sentado ou em pé.' },
  { nome: 'Elevação lateral', grupo_muscular: 'Ombro', descricao: 'Com halteres, braços estendidos.' },
  { nome: 'Rosca direta', grupo_muscular: 'Bíceps', descricao: 'Com barra ou halteres.' },
  { nome: 'Tríceps corda', grupo_muscular: 'Tríceps', descricao: 'Na polia alta, com corda.' },
  { nome: 'Abdominal supra', grupo_muscular: 'Abdômen', descricao: 'No solo ou banco declinado.' },
  { nome: 'Corrida', grupo_muscular: 'Cardio', descricao: 'Na esteira ou ao ar livre, ritmo moderado.' },
]

const totalExercicios = db
  .prepare('SELECT COUNT(*) AS total FROM exercicios')
  .get() as { total: number }

if (totalExercicios.total === 0) {
  const inserir = db.prepare(
    'INSERT INTO exercicios (nome, grupo_muscular, descricao) VALUES (?, ?, ?)'
  )
  const inserirTodos = db.transaction(() => {
    for (const exercicio of BIBLIOTECA_EXERCICIOS) {
      inserir.run(exercicio.nome, exercicio.grupo_muscular, exercicio.descricao)
    }
  })
  inserirTodos()
}

const CATALOGO_ALIMENTOS = [
  { nome: 'Arroz branco cozido', calorias_por_100g: 130, proteinas: 2.7, carboidratos: 28, gorduras: 0.3 },
  { nome: 'Feijão carioca cozido', calorias_por_100g: 76, proteinas: 4.8, carboidratos: 13.6, gorduras: 0.5 },
  { nome: 'Peito de frango grelhado', calorias_por_100g: 165, proteinas: 31, carboidratos: 0, gorduras: 3.6 },
  { nome: 'Ovo cozido', calorias_por_100g: 155, proteinas: 13, carboidratos: 1.1, gorduras: 11 },
  { nome: 'Pão francês', calorias_por_100g: 300, proteinas: 9, carboidratos: 58, gorduras: 3 },
  { nome: 'Banana', calorias_por_100g: 89, proteinas: 1.1, carboidratos: 23, gorduras: 0.3 },
  { nome: 'Maçã', calorias_por_100g: 52, proteinas: 0.3, carboidratos: 14, gorduras: 0.2 },
  { nome: 'Leite integral', calorias_por_100g: 61, proteinas: 3.2, carboidratos: 4.8, gorduras: 3.3 },
  { nome: 'Aveia em flocos', calorias_por_100g: 389, proteinas: 17, carboidratos: 66, gorduras: 7 },
  { nome: 'Batata-doce cozida', calorias_por_100g: 86, proteinas: 1.6, carboidratos: 20, gorduras: 0.1 },
  { nome: 'Carne bovina magra grelhada', calorias_por_100g: 217, proteinas: 26, carboidratos: 0, gorduras: 12 },
  { nome: 'Brócolis cozido', calorias_por_100g: 35, proteinas: 2.4, carboidratos: 7, gorduras: 0.4 },
  { nome: 'Iogurte natural', calorias_por_100g: 61, proteinas: 3.5, carboidratos: 4.7, gorduras: 3.3 },
  { nome: 'Whey protein (pó)', calorias_por_100g: 400, proteinas: 80, carboidratos: 8, gorduras: 5 },
  { nome: 'Azeite de oliva', calorias_por_100g: 884, proteinas: 0, carboidratos: 0, gorduras: 100 },
]

const totalAlimentos = db
  .prepare('SELECT COUNT(*) AS total FROM alimentos')
  .get() as { total: number }

if (totalAlimentos.total === 0) {
  const inserirAlimento = db.prepare(
    'INSERT INTO alimentos (nome, calorias_por_100g, proteinas, carboidratos, gorduras) VALUES (?, ?, ?, ?, ?)'
  )
  const inserirTodosAlimentos = db.transaction(() => {
    for (const alimento of CATALOGO_ALIMENTOS) {
      inserirAlimento.run(
        alimento.nome,
        alimento.calorias_por_100g,
        alimento.proteinas,
        alimento.carboidratos,
        alimento.gorduras
      )
    }
  })
  inserirTodosAlimentos()
}

export { db }
