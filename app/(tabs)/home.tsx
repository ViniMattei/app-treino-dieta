import { useCallback, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'

import { Card } from '@/src/components/Card'
import { useAuth } from '@/src/contexts/AuthContext'
import { buscarPlanoPorData, PlanoAlimentar } from '@/src/services/dietService'
import { hojeIso } from '@/src/utils/date'
import { listarPlanos, PlanoTreino } from '@/src/services/workoutService'

export default function Home() {
  const { usuario, token } = useAuth()
  const [planoAtivo, setPlanoAtivo] = useState<PlanoTreino | null>(null)
  const [planoAlimentar, setPlanoAlimentar] = useState<PlanoAlimentar | null>(null)
  const [metaCalorica, setMetaCalorica] = useState<number | null>(null)

  useFocusEffect(
    useCallback(() => {
      if (!token) return
      listarPlanos(token)
        .then(({ planos }) => setPlanoAtivo(planos.find((p) => p.ativo) ?? null))
        .catch(() => setPlanoAtivo(null))

      buscarPlanoPorData(hojeIso(), token)
        .then(({ plano, metaCalorica }) => {
          setPlanoAlimentar(plano)
          setMetaCalorica(metaCalorica)
        })
        .catch(() => setPlanoAlimentar(null))
    }, [token])
  )

  return (
    <View className="flex-1 bg-zinc-950 px-6 pt-16">
      <View className="mb-8">
        <Text className="text-sm font-medium uppercase tracking-widest text-violet-400">
          App Fitness
        </Text>
        <Text className="mt-2 text-4xl font-bold text-white">
          Olá, {usuario?.nome_completo.split(' ')[0]}
        </Text>
        <Text className="mt-2 text-base leading-6 text-zinc-400">
          Acompanhe seu treino e sua dieta com mais organização e foco.
        </Text>
      </View>

      <TouchableOpacity onPress={() => router.push('/workouts')}>
        <Card title="Treino de hoje">
          {planoAtivo ? (
            <>
              <Text className="text-base leading-6 text-zinc-300">{planoAtivo.nome}</Text>
              <Text className="mt-2 text-sm text-zinc-500">
                {planoAtivo.exercicios.length} exercícios planejados
              </Text>
            </>
          ) : (
            <Text className="text-base leading-6 text-zinc-300">
              Nenhum plano de treino ativo — toque para criar um
            </Text>
          )}
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/diet')}>
        <Card title="Dieta de hoje">
          {planoAlimentar ? (
            <>
              <Text className="text-base leading-6 text-zinc-300">
                {planoAlimentar.caloriasTotal} / {metaCalorica ?? '—'} kcal
              </Text>
              <Text className="mt-2 text-sm text-zinc-500">
                {planoAlimentar.refeicoes.length} refeições registradas
              </Text>
            </>
          ) : (
            <Text className="text-base leading-6 text-zinc-300">
              Nenhum plano alimentar criado ainda
            </Text>
          )}
        </Card>
      </TouchableOpacity>
    </View>
  )
}
