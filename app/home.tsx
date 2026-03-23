import { View, Text } from 'react-native'
import { router } from 'expo-router'

import { Card } from '@/src/components/Card'
import { Button } from '@/src/components/Button'

export default function Home() {
  return (
    <View className="flex-1 bg-zinc-950 px-6 pt-16">
      <View className="mb-8">
        <Text className="text-sm font-medium uppercase tracking-widest text-violet-400">
          App Fitness
        </Text>
        <Text className="mt-2 text-4xl font-bold text-white">
          Seu dia de treino
        </Text>
        <Text className="mt-2 text-base leading-6 text-zinc-400">
          Acompanhe seu treino e sua dieta com mais organização e foco.
        </Text>
      </View>

      <Card title="Treino de hoje">
        <Text className="text-base leading-6 text-zinc-300">
          Peito, tríceps e ombro
        </Text>
        <Text className="mt-2 text-sm text-zinc-500">
          6 exercícios planejados
        </Text>
      </Card>

      <Card title="Dieta de hoje">
        <Text className="text-base leading-6 text-zinc-300">
          2.500 kcal com foco em hipertrofia
        </Text>
        <Text className="mt-2 text-sm text-zinc-500">
          5 refeições organizadas
        </Text>
      </Card>

      <Card title="Seu objetivo">
        <Text className="text-base leading-6 text-zinc-300">
          Evoluir com constância, melhorar desempenho e manter disciplina.
        </Text>
      </Card>

      <View className="mt-4">
        <Button title="Sair" onPress={() => router.push('/')} />
      </View>
    </View>
  )
}
