import { useEffect, useState } from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'

import { Button } from '@/src/components/Button'
import { Input } from '@/src/components/Input'
import { useAuth } from '@/src/contexts/AuthContext'
import { ApiError } from '@/src/services/api'
import {
  Alimento,
  buscarPlanoPorData,
  criarAlimento,
  listarAlimentos,
  RefeicaoInput,
  salvarPlano,
  TipoRefeicao,
} from '@/src/services/dietService'
import { hojeIso } from '@/src/utils/date'

type Selecoes = Record<TipoRefeicao, Record<number, string>>

const TIPOS: { valor: TipoRefeicao; titulo: string }[] = [
  { valor: 'cafe_da_manha', titulo: 'Café da manhã' },
  { valor: 'almoco', titulo: 'Almoço' },
  { valor: 'jantar', titulo: 'Jantar' },
  { valor: 'lanche', titulo: 'Lanche' },
]

const SELECOES_VAZIAS: Selecoes = {
  cafe_da_manha: {},
  almoco: {},
  jantar: {},
  lanche: {},
}

export default function DietNew() {
  const { token } = useAuth()
  const data = hojeIso()
  const [tipoAtual, setTipoAtual] = useState<TipoRefeicao>('cafe_da_manha')
  const [alimentos, setAlimentos] = useState<Alimento[]>([])
  const [selecoes, setSelecoes] = useState<Selecoes>(SELECOES_VAZIAS)
  const [enviando, setEnviando] = useState(false)
  const [mostrarNovoAlimento, setMostrarNovoAlimento] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novasCalorias, setNovasCalorias] = useState('')
  const [novasProteinas, setNovasProteinas] = useState('')
  const [novosCarboidratos, setNovosCarboidratos] = useState('')
  const [novasGorduras, setNovasGorduras] = useState('')
  const [cadastrandoAlimento, setCadastrandoAlimento] = useState(false)

  useEffect(() => {
    if (!token) return

    listarAlimentos(token)
      .then(({ alimentos }) => setAlimentos(alimentos))
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar o catálogo de alimentos'))

    buscarPlanoPorData(data, token)
      .then(({ plano }) => {
        if (!plano) return
        const preenchidas: Selecoes = { ...SELECOES_VAZIAS }
        for (const refeicao of plano.refeicoes) {
          const itens: Record<number, string> = {}
          for (const item of refeicao.alimentos) {
            itens[item.alimento_id] = String(item.quantidade)
          }
          preenchidas[refeicao.tipo] = itens
        }
        setSelecoes(preenchidas)
      })
      .catch(() => {})
  }, [token, data])

  function alternarSelecao(alimentoId: number) {
    setSelecoes((atual) => {
      const doTipo = { ...atual[tipoAtual] }
      if (doTipo[alimentoId] != null) {
        delete doTipo[alimentoId]
      } else {
        doTipo[alimentoId] = '100'
      }
      return { ...atual, [tipoAtual]: doTipo }
    })
  }

  function atualizarQuantidade(alimentoId: number, valor: string) {
    setSelecoes((atual) => ({
      ...atual,
      [tipoAtual]: { ...atual[tipoAtual], [alimentoId]: valor },
    }))
  }

  async function handleCadastrarAlimento() {
    if (!token) return

    if (!novoNome.trim() || !novasCalorias) {
      Alert.alert('Atenção', 'Informe o nome e as calorias por 100g/ml')
      return
    }

    setCadastrandoAlimento(true)
    try {
      const { alimento } = await criarAlimento(
        {
          nome: novoNome,
          caloriasPor100g: Number(novasCalorias),
          proteinas: novasProteinas ? Number(novasProteinas) : undefined,
          carboidratos: novosCarboidratos ? Number(novosCarboidratos) : undefined,
          gorduras: novasGorduras ? Number(novasGorduras) : undefined,
        },
        token
      )

      setAlimentos((atual) => [...atual, alimento].sort((a, b) => a.nome.localeCompare(b.nome)))
      setSelecoes((atual) => ({
        ...atual,
        [tipoAtual]: { ...atual[tipoAtual], [alimento.id]: '100' },
      }))

      setNovoNome('')
      setNovasCalorias('')
      setNovasProteinas('')
      setNovosCarboidratos('')
      setNovasGorduras('')
      setMostrarNovoAlimento(false)
    } catch (error) {
      const mensagem =
        error instanceof ApiError ? error.message : 'Não foi possível cadastrar o alimento'
      Alert.alert('Erro', mensagem)
    } finally {
      setCadastrandoAlimento(false)
    }
  }

  async function handleSalvar() {
    if (!token) return

    const refeicoes: RefeicaoInput[] = TIPOS.map(({ valor }) => ({
      tipo: valor,
      alimentos: Object.entries(selecoes[valor]).map(([alimentoId, quantidade]) => ({
        alimentoId: Number(alimentoId),
        quantidade: Number(quantidade),
      })),
    }))

    const totalItens = refeicoes.reduce((soma, r) => soma + r.alimentos.length, 0)
    if (totalItens === 0) {
      Alert.alert('Atenção', 'Selecione ao menos um alimento')
      return
    }

    const itemInvalido = refeicoes
      .flatMap((r) => r.alimentos)
      .find((item) => !item.quantidade || item.quantidade <= 0)
    if (itemInvalido) {
      Alert.alert('Atenção', 'Informe uma quantidade válida para todos os alimentos selecionados')
      return
    }

    setEnviando(true)
    try {
      await salvarPlano({ data, refeicoes }, token)
      router.replace('/diet')
    } catch (error) {
      const mensagem =
        error instanceof ApiError ? error.message : 'Não foi possível salvar o plano'
      Alert.alert('Erro', mensagem)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-zinc-950"
      contentContainerStyle={{ padding: 24, paddingTop: 64 }}
    >
      <TouchableOpacity onPress={() => router.push('/diet')}>
        <Text className="mb-4 text-base font-medium text-violet-400">‹ Voltar</Text>
      </TouchableOpacity>

      <Text className="text-4xl font-bold text-white">Plano de hoje</Text>
      <Text className="mt-2 text-base leading-6 text-zinc-400">
        Escolha a refeição e selecione os alimentos.
      </Text>

      <View className="mt-6 flex-row flex-wrap gap-2">
        {TIPOS.map((tipo) => (
          <TouchableOpacity
            key={tipo.valor}
            onPress={() => setTipoAtual(tipo.valor)}
            className={`rounded-2xl border px-4 py-3 ${
              tipoAtual === tipo.valor
                ? 'border-violet-500 bg-violet-500/20'
                : 'border-zinc-800 bg-zinc-900'
            }`}
          >
            <Text className="font-medium text-white">{tipo.titulo}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="mt-4 gap-3">
        {alimentos.map((alimento) => {
          const quantidade = selecoes[tipoAtual][alimento.id]
          const selecionado = quantidade != null
          return (
            <TouchableOpacity
              key={alimento.id}
              onPress={() => alternarSelecao(alimento.id)}
              activeOpacity={0.8}
              className={`rounded-3xl border p-5 ${
                selecionado ? 'border-violet-500 bg-violet-500/10' : 'border-zinc-800 bg-zinc-900'
              }`}
            >
              <Text className="text-base font-bold text-white">{alimento.nome}</Text>
              <Text className="mt-1 text-sm text-zinc-500">
                {alimento.calorias_por_100g} kcal / 100g
              </Text>

              {selecionado && (
                <View className="mt-4">
                  <Text className="mb-1 text-xs text-zinc-400">Quantidade (g/ml)</Text>
                  <Input
                    value={quantidade}
                    onChangeText={(v) => atualizarQuantidade(alimento.id, v)}
                    keyboardType="numeric"
                  />
                  {Number(quantidade) > 0 && (
                    <Text className="mt-1 text-sm text-violet-400">
                      {Math.round((alimento.calorias_por_100g * Number(quantidade)) / 100)} kcal
                      para {quantidade}g/ml
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </View>

      {mostrarNovoAlimento ? (
        <View className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <Text className="mb-3 text-base font-bold text-white">Novo alimento</Text>

          <Input placeholder="Nome do alimento" value={novoNome} onChangeText={setNovoNome} />
          <Input
            placeholder="Calorias por 100g/ml"
            value={novasCalorias}
            onChangeText={setNovasCalorias}
            keyboardType="numeric"
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                placeholder="Proteínas (g)"
                value={novasProteinas}
                onChangeText={setNovasProteinas}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Input
                placeholder="Carboidratos (g)"
                value={novosCarboidratos}
                onChangeText={setNovosCarboidratos}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Input
                placeholder="Gorduras (g)"
                value={novasGorduras}
                onChangeText={setNovasGorduras}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Button
            title={cadastrandoAlimento ? 'Cadastrando...' : 'Adicionar à lista'}
            onPress={handleCadastrarAlimento}
            disabled={cadastrandoAlimento}
          />

          <TouchableOpacity onPress={() => setMostrarNovoAlimento(false)}>
            <Text className="mt-3 text-center text-sm text-zinc-500">Cancelar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setMostrarNovoAlimento(true)}
          className="mt-4 items-center rounded-2xl border border-dashed border-zinc-700 px-4 py-4"
        >
          <Text className="font-medium text-violet-400">
            + Não encontrou? Cadastre um novo alimento
          </Text>
        </TouchableOpacity>
      )}

      <View className="mt-6">
        <Button
          title={enviando ? 'Salvando...' : 'Salvar plano'}
          onPress={handleSalvar}
          disabled={enviando}
        />
      </View>
    </ScrollView>
  )
}
