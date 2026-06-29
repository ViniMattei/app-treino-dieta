import { useState } from 'react'
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native'
import { router } from 'expo-router'

import { Input } from '@/src/components/Input'
import { Button } from '@/src/components/Button'
import { useAuth } from '@/src/contexts/AuthContext'
import { ApiError } from '@/src/services/api'
import { Sexo } from '@/src/services/authService'

function paraDataIso(dataBr: string) {
  const [dia, mes, ano] = dataBr.split('/')
  if (!dia || !mes || !ano || ano.length !== 4) return null
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
}

export default function Register() {
  const { cadastrar } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [sexo, setSexo] = useState<Sexo | null>(null)
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleRegister() {
    if (!name || !email || !password || !dataNascimento || !sexo || !peso || !altura) {
      Alert.alert('Atenção', 'Preencha todos os campos')
      return
    }

    if (password.length < 8) {
      Alert.alert('Atenção', 'A senha deve conter no mínimo 8 caracteres')
      return
    }

    const dataIso = paraDataIso(dataNascimento)
    if (!dataIso) {
      Alert.alert('Atenção', 'Informe a data de nascimento no formato DD/MM/AAAA')
      return
    }

    setEnviando(true)
    try {
      await cadastrar({
        nomeCompleto: name,
        email,
        senha: password,
        dataNascimento: dataIso,
        sexo,
        pesoAtual: Number(peso.replace(',', '.')),
        altura: Number(altura.replace(',', '.')),
      })
      router.replace('/objective')
    } catch (error) {
      const mensagem =
        error instanceof ApiError ? error.message : 'Não foi possível concluir o cadastro'
      Alert.alert('Erro', mensagem)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-zinc-950"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-10">
        <Text className="text-4xl font-bold text-white">Criar conta</Text>
        <Text className="mt-2 text-base leading-6 text-zinc-400">
          Monte seu perfil e comece a organizar seus treinos e sua dieta.
        </Text>
      </View>

      <View className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
        <Input
          placeholder="Nome completo"
          value={name}
          onChangeText={setName}
        />

        <Input
          placeholder="Digite seu email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          placeholder="Digite sua senha (mín. 8 caracteres)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Input
          placeholder="Data de nascimento (DD/MM/AAAA)"
          value={dataNascimento}
          onChangeText={setDataNascimento}
          keyboardType="numeric"
        />

        <View className="mb-4 flex-row gap-3">
          <TouchableOpacity
            onPress={() => setSexo('feminino')}
            className={`flex-1 items-center rounded-2xl border px-4 py-4 ${
              sexo === 'feminino'
                ? 'border-violet-500 bg-violet-500/20'
                : 'border-zinc-800 bg-zinc-950'
            }`}
          >
            <Text className="font-medium text-white">Feminino</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSexo('masculino')}
            className={`flex-1 items-center rounded-2xl border px-4 py-4 ${
              sexo === 'masculino'
                ? 'border-violet-500 bg-violet-500/20'
                : 'border-zinc-800 bg-zinc-950'
            }`}
          >
            <Text className="font-medium text-white">Masculino</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              placeholder="Peso atual (kg)"
              value={peso}
              onChangeText={setPeso}
              keyboardType="decimal-pad"
            />
          </View>
          <View className="flex-1">
            <Input
              placeholder="Altura (m)"
              value={altura}
              onChangeText={setAltura}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Button
          title={enviando ? 'Cadastrando...' : 'Cadastrar'}
          onPress={handleRegister}
          disabled={enviando}
        />

        <TouchableOpacity onPress={() => router.push('/')}>
          <Text className="mt-6 text-center text-base font-medium text-violet-400">
            Voltar para login
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
