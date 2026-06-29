import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useCallback, useEffect, useState } from 'react'
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'

import { Button } from '@/src/components/Button'
import { Card } from '@/src/components/Card'
import { useAuth } from '@/src/contexts/AuthContext'
import { ApiError } from '@/src/services/api'
import {
  buscarPlanoPorData,
  excluirPlano,
  PlanoAlimentar,
  RefeicaoInput,
  salvarPlano,
} from '@/src/services/dietService'
import { hojeIso } from '@/src/utils/date'

const TITULO_TIPO = {
  cafe_da_manha: 'Café da manhã',
  almoco: 'Almoço',
  jantar: 'Jantar',
  lanche: 'Lanche',
}

export default function Diet() {
  const { token } = useAuth()
  const tabBarHeight = useBottomTabBarHeight()
  const [plano, setPlano] = useState<PlanoAlimentar | null>(null)
  const [metaCalorica, setMetaCalorica] = useState<number | null>(null)
  const [quantidades, setQuantidades] = useState<Record<number, string>>({})
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const data = hojeIso()

  const carregar = useCallback(async () => {
    if (!token) return
    try {
      const resposta = await buscarPlanoPorData(data, token)
      setPlano(resposta.plano)
      setMetaCalorica(resposta.metaCalorica)
    } catch {
      setPlano(null)
    }
  }, [token, data])

  useFocusEffect(
    useCallback(() => {
      carregar()
    }, [carregar])
  )

  useEffect(() => {
    if (!plano) {
      setQuantidades({})
      return
    }
    const iniciais: Record<number, string> = {}
    for (const refeicao of plano.refeicoes) {
      for (const item of refeicao.alimentos) {
        iniciais[item.id] = String(item.quantidade)
      }
    }
    setQuantidades(iniciais)
  }, [plano])

  async function handleExcluir() {
    if (!token) return
    try {
      await excluirPlano(data, token)
      carregar()
    } catch (error) {
      const mensagem =
        error instanceof ApiError ? error.message : 'Não foi possível excluir o plano'
      Alert.alert('Erro', mensagem)
    }
  }

  async function handleSalvarEdicao() {
    if (!token || !plano) return

    const refeicoes: RefeicaoInput[] = plano.refeicoes.map((refeicao) => ({
      tipo: refeicao.tipo,
      alimentos: refeicao.alimentos.map((item) => ({
        alimentoId: item.alimento_id,
        quantidade: Number(quantidades[item.id]),
      })),
    }))

    const itemInvalido = refeicoes
      .flatMap((r) => r.alimentos)
      .find((item) => !item.quantidade || item.quantidade <= 0)
    if (itemInvalido) {
      Alert.alert('Atenção', 'Informe uma quantidade válida para todos os alimentos')
      return
    }

    setSalvandoEdicao(true)
    try {
      await salvarPlano({ data, refeicoes }, token)
      await carregar()
    } catch (error) {
      const mensagem =
        error instanceof ApiError ? error.message : 'Não foi possível salvar as alterações'
      Alert.alert('Erro', mensagem)
    } finally {
      setSalvandoEdicao(false)
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-zinc-950"
      contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: tabBarHeight + 24 }}
    >
      <Text className="text-4xl font-bold text-white">Sua dieta</Text>
      <Text className="mt-2 text-base leading-6 text-zinc-400">
        Plano alimentar de hoje e total de calorias.
      </Text>

      <View className="mt-6">
        <Card title="Calorias de hoje">
          <Text className="text-3xl font-bold text-white">
            {plano?.caloriasTotal ?? 0}
            <Text className="text-base font-normal text-zinc-500"> / {metaCalorica ?? '—'} kcal</Text>
          </Text>
        </Card>
      </View>

      <Button
        title={plano ? 'Adicionar mais alimentos' : 'Criar plano de hoje'}
        onPress={() => router.push('/diet-new')}
      />

      {!plano && (
        <Text className="mt-8 text-center text-base text-zinc-500">
          Você ainda não montou seu plano alimentar de hoje.
        </Text>
      )}

      {plano && (
        <View className="mt-6 gap-3">
          {plano.refeicoes.map((refeicao) => (
            <View key={refeicao.id} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold text-white">{TITULO_TIPO[refeicao.tipo]}</Text>
                <Text className="text-sm text-zinc-500">{refeicao.caloriasTotal} kcal</Text>
              </View>

              {refeicao.alimentos.map((alimento) => {
                const caloriasPor100g = alimento.calorias / (alimento.quantidade / 100)
                const quantidadeAtual = quantidades[alimento.id] ?? ''
                const caloriasAtuais = Number(quantidadeAtual)
                  ? Math.round((caloriasPor100g * Number(quantidadeAtual)) / 100)
                  : 0

                return (
                  <View
                    key={alimento.id}
                    className="mt-3 flex-row items-center justify-between gap-3"
                  >
                    <Text className="flex-1 text-sm leading-5 text-zinc-300">{alimento.nome}</Text>
                    <TextInput
                      value={quantidadeAtual}
                      onChangeText={(v) =>
                        setQuantidades((atual) => ({ ...atual, [alimento.id]: v }))
                      }
                      keyboardType="numeric"
                      placeholderTextColor="#a1a1aa"
                      className="w-16 rounded-xl border border-zinc-800 bg-zinc-950 px-2 py-2 text-center text-sm text-white"
                    />
                    <Text className="w-20 text-right text-xs text-zinc-500">
                      {caloriasAtuais} kcal
                    </Text>
                  </View>
                )
              })}
            </View>
          ))}

          <Button
            title={salvandoEdicao ? 'Salvando...' : 'Salvar alterações nas quantidades'}
            onPress={handleSalvarEdicao}
            disabled={salvandoEdicao}
          />

          <TouchableOpacity
            onPress={handleExcluir}
            className="items-center rounded-2xl border border-red-500/50 px-4 py-3"
          >
            <Text className="font-medium text-red-400">Excluir plano de hoje</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}
