import { useState } from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { router } from 'expo-router'

import { Button } from '@/src/components/Button'
import { useAuth } from '@/src/contexts/AuthContext'
import { ApiError } from '@/src/services/api'
import { Objetivo } from '@/src/services/authService'

const OPCOES: { valor: Objetivo; titulo: string; descricao: string }[] = [
  {
    valor: 'perda_peso',
    titulo: 'Perda de peso',
    descricao: 'Reduzir peso corporal com déficit calórico controlado.',
  },
  {
    valor: 'ganho_massa',
    titulo: 'Ganho de massa muscular',
    descricao: 'Aumentar massa magra com treino de força e superávit calórico.',
  },
  {
    valor: 'manutencao',
    titulo: 'Manutenção do peso',
    descricao: 'Manter o peso atual com hábitos equilibrados.',
  },
]

export default function ObjectiveScreen() {
  const { definirObjetivo } = useAuth()
  const [selecionado, setSelecionado] = useState<Objetivo | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function handleConfirmar() {
    if (!selecionado) {
      Alert.alert('Atenção', 'Selecione um objetivo para continuar')
      return
    }

    setEnviando(true)
    try {
      await definirObjetivo(selecionado)
      router.replace('/home')
    } catch (error) {
      const mensagem =
        error instanceof ApiError ? error.message : 'Não foi possível salvar seu objetivo'
      Alert.alert('Erro', mensagem)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <View className="flex-1 bg-zinc-950 px-6 pt-16">
      <Text className="text-4xl font-bold text-white">Qual seu objetivo?</Text>
      <Text className="mt-2 text-base leading-6 text-zinc-400">
        Vamos usar isso para sugerir treinos e dietas compatíveis.
      </Text>

      <View className="mt-8 gap-3">
        {OPCOES.map((opcao) => (
          <TouchableOpacity
            key={opcao.valor}
            onPress={() => setSelecionado(opcao.valor)}
            className={`rounded-3xl border p-5 ${
              selecionado === opcao.valor
                ? 'border-violet-500 bg-violet-500/20'
                : 'border-zinc-800 bg-zinc-900'
            }`}
          >
            <Text className="text-lg font-bold text-white">{opcao.titulo}</Text>
            <Text className="mt-1 text-sm leading-5 text-zinc-400">
              {opcao.descricao}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="mt-8">
        <Button
          title={enviando ? 'Salvando...' : 'Confirmar'}
          onPress={handleConfirmar}
          disabled={enviando}
        />
      </View>
    </View>
  )
}
