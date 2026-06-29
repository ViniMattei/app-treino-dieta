import { useCallback, useEffect, useState } from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'

import { Button } from '@/src/components/Button'
import { Input } from '@/src/components/Input'
import { useAuth } from '@/src/contexts/AuthContext'
import { ApiError } from '@/src/services/api'
import {
  excluirRegistro,
  listarHistorico,
  registrarPeso,
  RegistroPeso,
} from '@/src/services/progressService'
import { hojeIso } from '@/src/utils/date'

const ALTURA_GRAFICO = 140

function formatarDataCurta(dataIso: string) {
  const [, mes, dia] = dataIso.split('-')
  return `${dia}/${mes}`
}

export default function Progress() {
  const { usuario, token, atualizarUsuario } = useAuth()
  const data = hojeIso()
  const [historico, setHistorico] = useState<RegistroPeso[]>([])
  const [peso, setPeso] = useState('')
  const [enviando, setEnviando] = useState(false)

  const carregar = useCallback(async () => {
    if (!token) return
    try {
      const { registros } = await listarHistorico(token)
      setHistorico(registros)
    } catch {
      setHistorico([])
    }
  }, [token])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function handleRegistrar() {
    if (!token) return

    const valor = Number(peso.replace(',', '.'))
    if (!valor || valor <= 0) {
      Alert.alert('Atenção', 'Informe um peso válido')
      return
    }

    setEnviando(true)
    try {
      await registrarPeso({ peso: valor, data }, token)
      setPeso('')
      await Promise.all([carregar(), atualizarUsuario()])
    } catch (error) {
      const mensagem =
        error instanceof ApiError ? error.message : 'Não foi possível registrar o peso'
      Alert.alert('Erro', mensagem)
    } finally {
      setEnviando(false)
    }
  }

  async function handleExcluir(dataRegistro: string) {
    if (!token) return
    try {
      await excluirRegistro(dataRegistro, token)
      await carregar()
    } catch (error) {
      const mensagem =
        error instanceof ApiError ? error.message : 'Não foi possível excluir o registro'
      Alert.alert('Erro', mensagem)
    }
  }

  const pesos = historico.map((r) => r.peso)
  const minPeso = pesos.length ? Math.min(...pesos) : 0
  const maxPeso = pesos.length ? Math.max(...pesos) : 0
  const intervalo = maxPeso - minPeso || 1

  return (
    <ScrollView
      className="flex-1 bg-zinc-950"
      contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 48 }}
    >
      <TouchableOpacity onPress={() => router.push('/profile')}>
        <Text className="mb-4 text-base font-medium text-violet-400">‹ Voltar</Text>
      </TouchableOpacity>

      <Text className="text-4xl font-bold text-white">Progresso de peso</Text>
      <Text className="mt-2 text-base leading-6 text-zinc-400">
        Registre seu peso periodicamente e acompanhe a evolução.
      </Text>

      <View className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
        <Text className="mb-3 text-base font-bold text-white">Registrar peso de hoje</Text>
        <View className="flex-row items-end gap-3">
          <View className="flex-1">
            <Input
              placeholder={`Peso atual (kg)${usuario ? ` — ex: ${usuario.peso_atual}` : ''}`}
              value={peso}
              onChangeText={setPeso}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
        <Button
          title={enviando ? 'Salvando...' : 'Salvar'}
          onPress={handleRegistrar}
          disabled={enviando}
        />
      </View>

      {historico.length > 0 && (
        <View className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <Text className="mb-4 text-base font-bold text-white">Evolução</Text>
          <View
            className="flex-row items-end justify-between gap-2"
            style={{ height: ALTURA_GRAFICO }}
          >
            {historico.map((registro) => {
              const alturaBarra =
                pesos.length > 1
                  ? Math.max(8, ((registro.peso - minPeso) / intervalo) * (ALTURA_GRAFICO - 32))
                  : ALTURA_GRAFICO - 32

              return (
                <View key={registro.id} className="flex-1 items-center justify-end">
                  <Text className="mb-1 text-[10px] text-zinc-400">{registro.peso}</Text>
                  <View
                    className="w-full rounded-t-lg bg-violet-500"
                    style={{ height: alturaBarra }}
                  />
                  <Text className="mt-1 text-[10px] text-zinc-500">
                    {formatarDataCurta(registro.data)}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>
      )}

      <View className="mt-6 gap-2">
        {historico
          .slice()
          .reverse()
          .map((registro) => (
            <View
              key={registro.id}
              className="flex-row items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3"
            >
              <Text className="text-sm text-zinc-300">{formatarDataCurta(registro.data)}</Text>
              <Text className="text-sm font-bold text-white">{registro.peso} kg</Text>
              <TouchableOpacity onPress={() => handleExcluir(registro.data)}>
                <Text className="text-sm text-red-400">Excluir</Text>
              </TouchableOpacity>
            </View>
          ))}

        {historico.length === 0 && (
          <Text className="mt-4 text-center text-base text-zinc-500">
            Você ainda não registrou nenhum peso.
          </Text>
        )}
      </View>
    </ScrollView>
  )
}
