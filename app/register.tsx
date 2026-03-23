import { useState } from 'react'
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native'
import { router } from 'expo-router'

import { Input } from '@/src/components/Input'
import { Button } from '@/src/components/Button'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos')
      return
    }

    Alert.alert('Sucesso', 'Cadastro realizado com sucesso')
    router.push('/')
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
          placeholder="Digite seu nome"
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
          placeholder="Digite sua senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button title="Cadastrar" onPress={handleRegister} />

        <TouchableOpacity onPress={() => router.push('/')}>
          <Text className="mt-6 text-center text-base font-medium text-violet-400">
            Voltar para login
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
