import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useCallback, useState } from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'

import { Button } from '@/src/components/Button'
import { useAuth } from '@/src/contexts/AuthContext'
import { ApiError } from '@/src/services/api'
import {
  ativarPlano,
  excluirPlano,
  listarPlanos,
  PlanoTreino,
} from '@/src/services/workoutService'

export default function Workouts() {
  const { token } = useAuth()
  const tabBarHeight = useBottomTabBarHeight()
  const [planos, setPlanos] = useState<PlanoTreino[]>([])
  const [carregando, setCarregando] = useState(true)

  const carregarPlanos = useCallback(async () => {
    if (!token) return
    setCarregando(true)
    try {
      const { planos } = await listarPlanos(token)
      setPlanos(planos)
    } catch (error) {
      const mensagem =
        error instanceof ApiError ? error.message : 'Não foi possível carregar seus planos'
      Alert.alert('Erro', mensagem)
    } finally {
      setCarregando(false)
    }
  }, [token])

  useFocusEffect(
    useCallback(() => {
      carregarPlanos()
    }, [carregarPlanos])
  )

  async function handleAtivar(id: number) {
    if (!token) return
    try {
      await ativarPlano(id, token)
      carregarPlanos()
    } catch (error) {
      const mensagem =
        error instanceof ApiError ? error.message : 'Não foi possível ativar o plano'
      Alert.alert('Erro', mensagem)
    }
  }

  async function handleExcluir(id: number) {
    if (!token) return
    try {
      await excluirPlano(id, token)
      carregarPlanos()
    } catch (error) {
      const mensagem =
        error instanceof ApiError ? error.message : 'Não foi possível excluir o plano'
      Alert.alert('Erro', mensagem)
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-zinc-950"
      contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: tabBarHeight + 24 }}
    >
      <Text className="text-4xl font-bold text-white">Seus treinos</Text>
      <Text className="mt-2 text-base leading-6 text-zinc-400">
        Crie planos de treino e escolha qual está ativo.
      </Text>

      <View className="mt-6">
        <Button title="Criar novo plano" onPress={() => router.push('/workout-new')} />
      </View>

      {!carregando && planos.length === 0 && (
        <Text className="mt-8 text-center text-base text-zinc-500">
          Você ainda não criou nenhum plano de treino.
        </Text>
      )}

      <View className="mt-6 gap-3">
        {planos.map((plano) => (
          <View
            key={plano.id}
            className={`rounded-3xl border p-5 ${
              plano.ativo ? 'border-violet-500 bg-violet-500/10' : 'border-zinc-800 bg-zinc-900'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-white">{plano.nome}</Text>
              {plano.ativo && (
                <Text className="text-xs font-bold uppercase text-violet-400">Ativo</Text>
              )}
            </View>

            <Text className="mt-1 text-sm text-zinc-500">
              {plano.exercicios.length} exercício(s)
            </Text>

            {plano.exercicios.map((exercicio) => (
              <Text key={exercicio.id} className="mt-2 text-sm leading-5 text-zinc-300">
                • {exercicio.nome} — {exercicio.series}x
                {exercicio.repeticoes ? ` ${exercicio.repeticoes} reps` : ` ${exercicio.duracao}s`}
              </Text>
            ))}

            <View className="mt-4 flex-row gap-3">
              {!plano.ativo && (
                <TouchableOpacity
                  onPress={() => handleAtivar(plano.id)}
                  className="flex-1 items-center rounded-2xl border border-violet-500 px-4 py-3"
                >
                  <Text className="font-medium text-violet-400">Ativar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => handleExcluir(plano.id)}
                className="flex-1 items-center rounded-2xl border border-red-500/50 px-4 py-3"
              >
                <Text className="font-medium text-red-400">Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
