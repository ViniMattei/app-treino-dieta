import { useEffect, useState } from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'

import { Button } from '@/src/components/Button'
import { Input } from '@/src/components/Input'
import { useAuth } from '@/src/contexts/AuthContext'
import { ApiError } from '@/src/services/api'
import { criarPlano, Exercicio, listarExercicios } from '@/src/services/workoutService'

type Selecao = { series: string; repeticoes: string }

export default function WorkoutNew() {
  const { token } = useAuth()
  const [nome, setNome] = useState('')
  const [exercicios, setExercicios] = useState<Exercicio[]>([])
  const [selecionados, setSelecionados] = useState<Record<number, Selecao>>({})
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!token) return
    listarExercicios(token)
      .then(({ exercicios }) => setExercicios(exercicios))
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar a biblioteca de exercícios'))
  }, [token])

  function alternarSelecao(id: number) {
    setSelecionados((atual) => {
      const copia = { ...atual }
      if (copia[id]) {
        delete copia[id]
      } else {
        copia[id] = { series: '3', repeticoes: '10' }
      }
      return copia
    })
  }

  function atualizarCampo(id: number, campo: keyof Selecao, valor: string) {
    setSelecionados((atual) => ({
      ...atual,
      [id]: { ...atual[id], [campo]: valor },
    }))
  }

  async function handleSalvar() {
    if (!token) return

    if (!nome.trim()) {
      Alert.alert('Atenção', 'Informe o nome do plano')
      return
    }

    const ids = Object.keys(selecionados)
    if (ids.length === 0) {
      Alert.alert('Atenção', 'Selecione ao menos um exercício')
      return
    }

    const itens = ids.map((id) => {
      const selecao = selecionados[Number(id)]
      return {
        exercicioId: Number(id),
        series: Number(selecao.series),
        repeticoes: Number(selecao.repeticoes),
      }
    })

    const itemInvalido = itens.find((item) => !item.series || !item.repeticoes)
    if (itemInvalido) {
      Alert.alert('Atenção', 'Preencha séries e repetições para todos os exercícios selecionados')
      return
    }

    setEnviando(true)
    try {
      await criarPlano({ nome, exercicios: itens }, token)
      router.replace('/workouts')
    } catch (error) {
      const mensagem =
        error instanceof ApiError ? error.message : 'Não foi possível criar o plano'
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
      <TouchableOpacity onPress={() => router.push('/workouts')}>
        <Text className="mb-4 text-base font-medium text-violet-400">‹ Voltar</Text>
      </TouchableOpacity>

      <Text className="text-4xl font-bold text-white">Novo plano</Text>
      <Text className="mt-2 text-base leading-6 text-zinc-400">
        Dê um nome e selecione os exercícios.
      </Text>

      <View className="mt-6">
        <Input placeholder="Nome do plano" value={nome} onChangeText={setNome} />
      </View>

      <View className="mt-2 gap-3">
        {exercicios.map((exercicio) => {
          const selecionado = selecionados[exercicio.id]
          return (
            <TouchableOpacity
              key={exercicio.id}
              onPress={() => alternarSelecao(exercicio.id)}
              activeOpacity={0.8}
              className={`rounded-3xl border p-5 ${
                selecionado
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-zinc-800 bg-zinc-900'
              }`}
            >
              <Text className="text-base font-bold text-white">{exercicio.nome}</Text>
              <Text className="mt-1 text-sm text-zinc-500">{exercicio.grupo_muscular}</Text>

              {selecionado && (
                <View className="mt-4 flex-row gap-3">
                  <View className="flex-1">
                    <Text className="mb-1 text-xs text-zinc-400">Séries</Text>
                    <Input
                      value={selecionado.series}
                      onChangeText={(v) => atualizarCampo(exercicio.id, 'series', v)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-xs text-zinc-400">Repetições</Text>
                    <Input
                      value={selecionado.repeticoes}
                      onChangeText={(v) => atualizarCampo(exercicio.id, 'repeticoes', v)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </View>

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
