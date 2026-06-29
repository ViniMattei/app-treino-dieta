import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'

import { Button } from '@/src/components/Button'
import { Card } from '@/src/components/Card'
import { useAuth } from '@/src/contexts/AuthContext'

const TITULO_OBJETIVO = {
  perda_peso: 'Perda de peso',
  ganho_massa: 'Ganho de massa muscular',
  manutencao: 'Manutenção do peso',
}

const TITULO_SEXO = {
  masculino: 'Masculino',
  feminino: 'Feminino',
}

function formatarData(dataIso: string) {
  const [ano, mes, dia] = dataIso.split('-')
  return `${dia}/${mes}/${ano}`
}

export default function Profile() {
  const { usuario, sair } = useAuth()
  const tabBarHeight = useBottomTabBarHeight()

  async function handleSair() {
    await sair()
    router.replace('/')
  }

  if (!usuario) return null

  return (
    <ScrollView
      className="flex-1 bg-zinc-950"
      contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: tabBarHeight + 24 }}
    >
      <Text className="text-4xl font-bold text-white">Seu perfil</Text>
      <Text className="mt-2 text-base leading-6 text-zinc-400">
        Seus dados cadastrais e objetivo atual.
      </Text>

      <View className="mt-6">
        <Card title="Dados pessoais">
          <View className="gap-3">
            <View>
              <Text className="text-xs text-zinc-500">Nome completo</Text>
              <Text className="text-base text-white">{usuario.nome_completo}</Text>
            </View>
            <View>
              <Text className="text-xs text-zinc-500">E-mail</Text>
              <Text className="text-base text-white">{usuario.email}</Text>
            </View>
            <View>
              <Text className="text-xs text-zinc-500">Data de nascimento</Text>
              <Text className="text-base text-white">
                {formatarData(usuario.data_nascimento)}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-zinc-500">Sexo</Text>
              <Text className="text-base text-white">{TITULO_SEXO[usuario.sexo]}</Text>
            </View>
            <View className="flex-row gap-6">
              <View>
                <Text className="text-xs text-zinc-500">Peso atual</Text>
                <Text className="text-base text-white">{usuario.peso_atual} kg</Text>
              </View>
              <View>
                <Text className="text-xs text-zinc-500">Altura</Text>
                <Text className="text-base text-white">{usuario.altura} m</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card title="Objetivo">
          <Text className="text-base leading-6 text-zinc-300">
            {usuario.objetivo ? TITULO_OBJETIVO[usuario.objetivo] : 'Objetivo ainda não definido'}
          </Text>
        </Card>

        <TouchableOpacity onPress={() => router.push('/progress')}>
          <Card title="Progresso de peso">
            <Text className="text-base leading-6 text-zinc-300">
              Peso atual: {usuario.peso_atual} kg
            </Text>
            <Text className="mt-1 text-sm text-zinc-500">
              Toque para registrar e ver o histórico
            </Text>
          </Card>
        </TouchableOpacity>

        <Button title="Sair" onPress={handleSair} />
      </View>
    </ScrollView>
  )
}
