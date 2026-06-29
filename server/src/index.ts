import cors from 'cors'
import express from 'express'
import './db'
import alimentosRouter from './routes/alimentos'
import exerciciosRouter from './routes/exercicios'
import planosAlimentaresRouter from './routes/planosAlimentares'
import planosTreinoRouter from './routes/planosTreino'
import registrosPesoRouter from './routes/registrosPeso'
import sessoesRouter from './routes/sessoes'
import usuariosRouter from './routes/usuarios'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/usuarios', usuariosRouter)
app.use('/sessoes', sessoesRouter)
app.use('/exercicios', exerciciosRouter)
app.use('/planos-treino', planosTreinoRouter)
app.use('/alimentos', alimentosRouter)
app.use('/planos-alimentares', planosAlimentaresRouter)
app.use('/registros-peso', registrosPesoRouter)

const PORT = Number(process.env.PORT) || 3333

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`)
})
